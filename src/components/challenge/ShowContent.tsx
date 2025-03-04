//import { withAuth } from "../Auth";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { sessionState } from "../SessionState";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { Tutor } from "../tutorEcuaciones/Tutor";
import type Plain from "../lvltutor/Plain";
import type { ExType } from "../lvltutor/Tools/ExcerciseType";
import { Text, Box } from "@chakra-ui/react";
import Info from "../../utils/Info";
import DynamicTutorLogic from "../LogicTutor/DynamicTutorLogic";
import type { ExLog } from "../LogicTutor/Tools/ExcerciseType2";

const DynamicTutorFac = dynamic<{ exercise?: Object; topicId?: string }>(() =>
  import("../tutorFactorizacion/TutorFac").then(mod => mod.TutorFac),
);

const DynamicPlain = dynamic<ComponentProps<typeof Plain>>(() =>
  import("../lvltutor/Plain").then(mod => mod.Plain),
);

const DynamicTutorEcu = dynamic<ComponentProps<typeof Tutor>>(() =>
  import("../tutorEcuaciones/Tutor").then(mod => mod.Tutor),
);

const DynamicTutorGeom = dynamic<{ exercise?: Object; topicId?: string }>(() =>
  import("../tutorGeometria/TutorGeom").then(mod => mod.TutorGeom),
);

const DynamicTutorWP = dynamic<{ exercise?: Object; topicId?: string }>(() =>
  import("../tutorWordProblems/TutorWordProblem").then(mod => mod.TutorWordProblem),
);

export default function ShowContent() {

  const snap = useSnapshot(sessionState);

  useEffect(() => {
    console.log("Current Content:", snap.currentContent?.json);
    console.log("Current Topic:", snap.topic);
  }, [snap.currentContent, snap.topic]);

  return (
    <>
      <Box textAlign="right">
        <Info />
      </Box>

      <div>
        {snap.currentContent?.json &&
        ["ftc5s", "fc1s", "fdc2s", "fdsc2", "fcc3s"].includes(snap.currentContent?.json?.type) ? (
          <DynamicTutorFac
            key={`${snap.currentContent?.json?.type}-${snap.topic}`}
            exercise={snap.currentContent?.json}
            topicId={snap.topic}
          ></DynamicTutorFac>
        ) : snap.currentContent &&
          snap.currentContent?.json?.type == "lvltutor" &&
          !!snap.currentContent?.json ? (
          <DynamicPlain
            key={`${snap.currentContent?.json?.type}-${snap.topic}`}
            steps={snap.currentContent?.json as ExType}
            topicId={snap.topic}
          ></DynamicPlain>
        ) : snap.currentContent &&
          ["ecc5s", "secl5s", "ecl2s", "mo"].includes(snap.currentContent?.json?.type) ? (
          <DynamicTutorEcu
            key={`${snap.currentContent?.json?.type}-${snap.topic}`}
            exercise={snap.currentContent?.json}
            topicId={snap.topic}
          ></DynamicTutorEcu>
        ) : snap.currentContent &&
          [
            "areaperimetro1",
            "areaperimetro2",
            "pitagoras1",
            "pitagoras2",
            "thales1",
            "thales2",
          ].includes(snap.currentContent?.json?.type) ? (
          <DynamicTutorGeom
            key={`${snap.currentContent?.json?.type}-${snap.topic}`}
            exercise={snap.currentContent?.json}
            topicId={snap.topic}
          ></DynamicTutorGeom>
        ) : snap.currentContent && snap.currentContent?.json.type == "wordProblem" ? (
          <DynamicTutorWP
            key={`${snap.currentContent?.json?.type}-${snap.topic}`}
            exercise={snap.currentContent?.json}
            topicId={snap.topic}
          ></DynamicTutorWP>
        ) : snap.currentContent && snap.currentContent?.json.type == "lvltutor2" ? (
          <DynamicTutorLogic
            key={`${snap.currentContent?.json?.type}-${snap.topic}`}
            exc={snap.currentContent?.json as ExLog}
            topicId={snap.topic}
          />
        ) : (
          <Text>No existe el contenido que desea cargar</Text>
        )}
      </div>
    </>
  );
}
