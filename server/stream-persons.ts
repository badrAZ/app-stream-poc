import fs from "fs";
import { FastifyReply } from "fastify";
import readline from "readline";
import { Readable } from "node:stream";

const addPushInterval = (stream: Readable) => {
  const interval = 2e3;
  let fifoLock = Promise.resolve();

  return (chunk: any) => {
    fifoLock = fifoLock.then(
      () =>
        new Promise((resolve) => {
          stream.push(chunk);

          setTimeout(resolve, interval);
        })
    );

    return fifoLock;
  };
};

const getLineParser = (
  startLetter: string,
  startIndex: number,
  endIndex: number,
  onPush: (chunk: any) => Promise<void>,
  onClose: () => void
) => {
  let isHeader = true;
  let currentItemIndex = 0;
  return function parseLine(line: string) {
    // skip header
    if (isHeader) {
      isHeader = false;
      return;
    }

    const [id, firstName, lastName, email] = line.split(",");

    if (firstName.startsWith(startLetter.toUpperCase())) {
      if (currentItemIndex >= startIndex && currentItemIndex <= endIndex) {
        onPush(
          JSON.stringify({
            id,
            firstName,
            lastName,
            email,
          })
        ).catch(console.error);
      }

      currentItemIndex++;
    }

    if (currentItemIndex > endIndex) {
      onClose()
    }
  };
};

export default function streamPersons({
  startLetter,
  page,
  itemsPerPage,
  res,
}: {
  startLetter: string;
  page: number;
  itemsPerPage: number;
  res: FastifyReply;
}) {
  const personsStream = new Readable({
    read() {},
  });
  res.type("application/octet-stream").send(personsStream);
  const push = addPushInterval(personsStream);

  const readlineStream = readline.createInterface({
    input: fs.createReadStream("./data.csv"),
  });
  const parseLine = getLineParser(
    startLetter,
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage - 1,
    push,
    () => {
      readlineStream.removeListener("line", parseLine);
      readlineStream.close();
    }
  );

  readlineStream.on("line", parseLine).once("close", () => {
    push(null).catch(console.error); // notify the end of the stream
  });
}
