import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { Button, Spacer, Spinner, Textarea } from "@chakra-ui/react";
import { sessionState } from "./SessionState";
import Link from "next/link";
import { useAction } from "../utils/action";
import { useUpdateModel } from "../utils/updateModel";
import { useAuth } from "./Auth";
import parameters from "./../components/contentSelectComponents/parameters.json";

const colors = {
  orange: "#FFBA5A",
  grey: "#a9a9a9",
};

function RatingQuestion({ useAlternateRoute = false }) {
  const [currentValue, setCurrentValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(undefined);
  const stars = Array(5).fill(0);
  const ruta = sessionState.nextContentPath;
  const action = useAction();
  const content = sessionState.currentContent.id;
  const topic = sessionState.topic;
  const selectionData = sessionState.selectionData;
  const callback = sessionState.callback;
  const callbackType = sessionState.callbackType;

  const [timeToUpdateModel, SetTimeToUpdateModel] = useState(true);
  const { updateModel, mutation } = useUpdateModel();
  useEffect(() => {
    setTimeout(() => {
      SetTimeToUpdateModel(false);
      updateModel({
        typeModel: "BKT",
        domainID: "1",
      });
    }, 1800);
  }, []);

  const handleClick = value => {
    setCurrentValue(value);
  };

  const handleMouseOver = newHoverValue => {
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(undefined);
  };

  const { user } = useAuth();

  const handleClick2 = () => {
    action({
      verbName: "selectionRating",
      result: currentValue,
      contentID: content,
      topicID: topic,
      extra: { selectionData },
    });
    if (callbackType === "challenge") {
      callback();
    } else {
      //callback(ruta);
    }
  };
  return (
    <div style={styles.container}>
      {selectionData.length > 1 ? (
        <h2>{parameters.ratingQuestion.experimentalQuestion}</h2>
      ) : (
        <h2>{parameters.ratingQuestion.controlQuestion}</h2>
      )}

      <div style={styles.stars}>
        {stars.map((_, index) => {
          return (
            <FaStar
              key={index}
              size={24}
              onClick={() => handleClick(index + 1)}
              onMouseOver={() => handleMouseOver(index + 1)}
              onMouseLeave={handleMouseLeave}
              color={(hoverValue || currentValue) > index ? colors.orange : colors.grey}
              style={{
                marginRight: 10,
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>
      {/*<Link href={ruta}>*/}
      <Button
        style={styles.button}
        disabled={currentValue != 0 && !mutation.isLoading ? false : true}
        onClick={handleClick2}
      >
        {!mutation.isLoading && !timeToUpdateModel && parameters.ratingQuestion.buttonMsg}
        {(mutation.isLoading || timeToUpdateModel) && (
          <>
            {parameters.ratingQuestion.buttonWaitMsg} &nbsp;&nbsp;
            <Spinner emptyColor="gray.200" color="blue.500" />
          </>
        )}
      </Button>
      {/*</Link>*/}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
  },
  stars: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: 5,
  },
  button: {
    border: "1px solid #a9a9a9",
    borderRadius: 5,
    width: 300,
    padding: 10,
  },
};

export default RatingQuestion;
