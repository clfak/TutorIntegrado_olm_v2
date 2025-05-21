import { Stack, Text } from "@chakra-ui/react";
import { FaBookOpen, FaHome, FaQuestionCircle, FaSearch } from "react-icons/fa";
import { useAuth } from "./Auth";
import { DarkModeToggle } from "./DarkModeToggle";
import { ScrollArea } from "./ScrollArea";
import { SidebarLink } from "./SidebarLink";

export function Navigation() {
  const { user } = useAuth();

  const admin = (user?.role ?? "") == "ADMIN" ? true : false;

  return (
    <ScrollArea pt="5" pb="6">
      <Stack pb="6">
        <SidebarLink icon={<FaHome />} href="/">
          Inicio
        </SidebarLink>
        {user && admin && (
          <>
            <Text fontWeight="black">Selección por Código</Text>
            <SidebarLink icon={<FaSearch />} href={"selectByCode"}>
              Search by Code
            </SidebarLink>
          </>
        )}
      </Stack>

      <Stack pb="6">
        {user && !user.tags.includes("wp-test-user") && (
          <>
            <Text fontWeight="black">Tópicos</Text>
            <SidebarLink key="1" href={"topicSelect?&registerTopic=44"}>
              Productos Notables
            </SidebarLink>
            <SidebarLink key="2" href={"topicSelect?&registerTopic=4"}>
              Factorización
            </SidebarLink>
            <SidebarLink key="3" href={"topicSelect?&registerTopic=19"}>
              Potencias
            </SidebarLink>
            <SidebarLink key="4" href={"topicSelect?&registerTopic=68"}>
              Raíces
            </SidebarLink>
            <SidebarLink key="5" href={"topicSelect?&registerTopic=31"}>
              Fracciones
            </SidebarLink>
            <SidebarLink key="6" href={"topicSelect?&registerTopic=24"}>
              Ecuaciones
            </SidebarLink>
            <SidebarLink key="7" href={"topicSelect?&registerTopic=52"}>
              Álgebra de Polinomios
            </SidebarLink>
            <SidebarLink key="8" href={"wpExercises?topic=34,35&registerTopic=34"}>
              Ejercicios en contexto
            </SidebarLink>
            <SidebarLink key="9" href={"topicSelect?&registerTopic=37"}>
              Lógica y Teoría de Conjuntos
            </SidebarLink>
            <Stack fontWeight="black" pb="6">
              <SidebarLink icon={<FaBookOpen />} href="challenge">
                Desafíos
              </SidebarLink>
            </Stack>
          </>
        )}
      </Stack>

      <Stack fontWeight="black" pb="6">
        <SidebarLink icon={<FaQuestionCircle />} href="tutorial">
          Tutorial
        </SidebarLink>
      </Stack>

      <Stack alignItems="center">
        <DarkModeToggle />
      </Stack>
    </ScrollArea>
  );
}
