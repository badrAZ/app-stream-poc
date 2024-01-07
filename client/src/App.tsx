import React from "react";
import { getPersons } from "./service";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroller";

const LETTERS = new Array(26)
  .fill(null)
  .map((_, key) => String.fromCharCode(key + 65));
const ITEMS_PER_PAGE = 5;

function App() {
  const [startLetter, setStartLetter] = React.useState("A");
  const [page, setPage] = React.useState(-1);
  const hasMore = page <= 10;
  const [data, setData] = React.useState<{ [key: string]: any }[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchData = (page: number, startLetter: string) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setPage(page);
    setStartLetter(startLetter);
    getPersons({ startLetter, page, itemsPerPage: ITEMS_PER_PAGE }, (item) => {
      setData((data) => [...data, item]);
    })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const displayedItems = React.useMemo(
    () =>
      new Array(page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
        .fill(null)
        .map((_, key) => data[key] ?? { id: key }),
    [data, page]
  );

  return (
    <Box paddingTop="30px" display="flex" justifyContent="center">
      <Box flexDirection="column" gap="10px">
        <ToggleButtonGroup
          value={startLetter}
          onChange={(_, value) => {
            if (!value) {
              return;
            }
            setData([])
            fetchData(0, value);
          }}
          exclusive
        >
          {LETTERS.map((letter) => (
            <ToggleButton key={letter} value={letter} color="primary">
              {letter}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box
          height={350}
          width={400}
          margin="auto"
          overflow="auto"
          marginTop="10px"
        >
          <InfiniteScroll
            pageStart={0}
            loadMore={() => {
              fetchData(page + 1, startLetter);
            }}
            hasMore={hasMore}
            useWindow={false}
          >
            <List
              sx={{
                display: "flex",
                gap: "2px",
                flexDirection: "column",
                alignItems: "center",
                padding: "0px",
              }}
            >
              {displayedItems.map((item) => (
                <ListItem key={item.id} sx={{ padding: "0px" }}>
                  {item.firstName ? (
                    <ListItemText
                      primary={item.firstName}
                      secondary={item.lastName}
                      sx={{
                        backgroundColor: "#ecf0f1",
                        padding: "10px",
                        border: "3px",
                      }}
                    />
                  ) : (
                    <Skeleton variant="rectangular" width={400} height={70} />
                  )}
                </ListItem>
              ))}
            </List>
          </InfiniteScroll>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
