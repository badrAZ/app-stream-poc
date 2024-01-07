import Fastify, { FastifyInstance } from "fastify";
import streamPersons from "./stream-persons";

type GetPersonsType = {
  Querystring: { startLetter: string; page: number; itemsPerPage: number };
};

const fastify: FastifyInstance = Fastify({ logger: true });

fastify.register(async (instance) => {
  instance.get<GetPersonsType>("/persons", (req, res) => {
    const { startLetter, page, itemsPerPage } = req.query;
    streamPersons({
      startLetter,
      page: +page,
      itemsPerPage: +itemsPerPage,
      res,
    });
  });
});

async function main() {
  await fastify.listen({ port: 3000 });
}

main().catch((err) => fastify.log.error(err));
