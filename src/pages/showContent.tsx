import { withAuth } from "../components/Auth";
import { sessionState } from "../components/SessionState";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { Tutor } from "../components/tutorEcuaciones/Tutor";
import type Plain from "../components/lvltutor/Plain";
import type { ExType } from "../components/lvltutor/Tools/ExcerciseType";
import { Text, Box } from "@chakra-ui/react";
import Info from "../utils/Info";
import DynamicTutorLogic from "../components/LogicTutor/DynamicTutorLogic";
import type { ExLog } from "../components/LogicTutor/Tools/ExcerciseType2";
const DynamicTutorFac = dynamic<{ exercise?: Object; topicId?: string }>(() =>
  import("../components/tutorFactorizacion/TutorFac").then(mod => mod.TutorFac),
);

const DynamicPlain = dynamic<ComponentProps<typeof Plain>>(() =>
  import("../components/lvltutor/Plain").then(mod => mod.Plain),
);

const DynamicTutorEcu = dynamic<ComponentProps<typeof Tutor>>(() =>
  import("../components/tutorEcuaciones/Tutor").then(mod => mod.Tutor),
);

const DynamicTutorGeom = dynamic<{ exercise?: Object; topicId?: string }>(() =>
  import("../components/tutorGeometria/TutorGeom").then(mod => mod.TutorGeom),
);

const DynamicTutorWP = dynamic<{ exercise?: Object; topicId?: string }>(() =>
  import("../components/tutorWordProblems/TutorWordProblem").then(mod => mod.TutorWordProblem),
);

export default withAuth(function ShowContent() {
  const content = sessionState.currentContent;
  const topic = sessionState.topic;
  const code = sessionState.currentContent.code;

  //console.log("Content --------->", content);
  //console.log("topic --------->", topic);

  return (
    <>
      <Box
        position="absolute"
        top="0"
        right="0"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={4}
      >
        <Text fontSize="sm" color="gray.500">
          {code}
        </Text>
        <Info />
      </Box>

      <div>
        {content && ["ftc5s", "fc1s", "fdc2s", "fdsc2", "fcc3s"].includes(content?.json?.type) ? (
          <DynamicTutorFac key="1" exercise={content.json} topicId={topic}></DynamicTutorFac>
        ) : content && content?.json?.type == "lvltutor" && !!content.json ? (
          <DynamicPlain key="2" steps={content.json as ExType} topicId={topic}></DynamicPlain>
        ) : content && ["ecc5s", "secl5s", "ecl2s", "mo"].includes(content?.json?.type) ? (
          <DynamicTutorEcu key="3" exercise={content.json} topicId={topic}></DynamicTutorEcu>
        ) : content &&
          [
            "areaperimetro1",
            "areaperimetro2",
            "pitagoras1",
            "pitagoras2",
            "thales1",
            "thales2",
          ].includes(content?.json?.type) ? (
          <DynamicTutorGeom key="4" exercise={content.json} topicId={topic}></DynamicTutorGeom>
        ) : content && content?.json.type == "wordProblem" ? (
          <DynamicTutorWP key="5" exercise={content.json} topicId={topic}></DynamicTutorWP>
        ) : content && content?.json.type == "lvltutor2" ? (
          <DynamicTutorLogic key="6" exc={content.json as ExLog} topicId={topic} />
        ) : (
          <Text>No existe el contenido que desea cargar</Text>
        )}
      </div>
    </>
  );
});
