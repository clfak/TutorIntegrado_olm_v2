import {
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Answers } from "./Answers";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import React from "react";

const labelStyles = {
  mt: "2",
  ml: "-2.5",
  fontSize: "sm",
  color: "white",
};

const Ranked = ({ index }: { index: number }) => {
  const [change, setChange] = useState(false);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const sub = useSnapshot(Answers);
  useEffect(() => {
    Answers.ans["q" + index] = [{ didreply: false, value: "" }];
  }, []);
  return (
    <>
      <Text hidden={sub.sumbmit ? change : true} textColor={"red.500"}>
        Este campo es requerido
      </Text>
      <Slider
        defaultValue={50}
        min={0}
        max={100}
        step={1}
        color={"white"}
        w={"80%"}
        onChange={v => {
          Answers.ans["q" + index] = [{ didreply: true, value: v.toFixed(0) }];
          setChange(true);
          setSliderValue(v);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={0} {...labelStyles}>
          0
        </SliderMark>
        <SliderMark value={20} {...labelStyles}>
          20
        </SliderMark>
        <SliderMark value={40} {...labelStyles}>
          40
        </SliderMark>
        <SliderMark value={60} {...labelStyles}>
          60
        </SliderMark>
        <SliderMark value={80} {...labelStyles}>
          80
        </SliderMark>
        <SliderMark value={100} {...labelStyles}>
          100
        </SliderMark>
        <SliderTrack bg="white">
          <SliderFilledTrack bg="white" />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="teal.500"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={`${sliderValue}%`}
        >
          <SliderThumb boxSize={6} />
        </Tooltip>
      </Slider>
    </>
  );
};

export default Ranked;
