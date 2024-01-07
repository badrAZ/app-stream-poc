export const getPersons = async (
  params: {
    startLetter: string;
    page: number;
    itemsPerPage: number;
  },
  onData: (data: { [key: string]: any }) => void
) => {
  const res = await fetch(
    `/persons?${new URLSearchParams({
      startLetter: params.startLetter,
      page: String(params.page),
      itemsPerPage: String(params.itemsPerPage),
    })}`,
  );
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    onData(JSON.parse(decoder.decode(value, { stream: true })));
  }
};
