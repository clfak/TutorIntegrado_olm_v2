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
            <SidebarLink
              key="1"
              href={"contentSelect?topic=44,45,46,47,48,49,50,51,62&registerTopic=44"}
            >
              Productos Notables
            </SidebarLink>
            <SidebarLink key="2" href={"contentSelect?topic=16,4,3,5,6,7,8&registerTopic=4"}>
              Factorización
            </SidebarLink>
            <SidebarLink key="3" href={"contentSelect?topic=19,21,22,64&registerTopic=19"}>
              Potencias
            </SidebarLink>
            <SidebarLink key="4" href={"contentSelect?topic=68,23,67&registerTopic=68"}>
              Raíces
            </SidebarLink>
            <SidebarLink key="5" href={"contentSelect?topic=69,20&registerTopic=69"}>
              Notación Científica
            </SidebarLink>
            <SidebarLink key="6" href={"contentSelect?topic=16,31,17,18,63&registerTopic=31"}>
              Fracciones
            </SidebarLink>
            <SidebarLink key="7" href={"contentSelect?topic=33,26&registerTopic=33"}>
              Ecuaciones Lineales
            </SidebarLink>
            <SidebarLink key="8" href={"contentSelect?topic=24,25&registerTopic=24"}>
              Ecuaciones Cuadráticas
            </SidebarLink>
            <SidebarLink key="9" href={"contentSelect?topic=52,53,54,55,56&registerTopic=52"}>
              Álgebra de Polinomios
            </SidebarLink>
            <SidebarLink key="10" href={"wpExercises?topic=34,35&registerTopic=34"}>
              Ejercicios con contexto
            </SidebarLink>
            <SidebarLink key="11" href={"contentSelect?topic=38,40,43&registerTopic=37"}>
              Lógica y Teoría de Conjuntos
            </SidebarLink>
            <SidebarLink key="12" href={"topicSelect?topic=4,3,5,6,7,8&registerTopic=4"}>
              Fcprueba
            </SidebarLink>
            <SidebarLink
              key="13"
              href={"topicSelect?topic=44,45,46,47,48,49,50,51,62&registerTopic=44"}
            >
              Productos Notables
            </SidebarLink>
            <Stack fontWeight="black" pb="6">
              <SidebarLink icon={<FaBookOpen />} href="challenge">
                Desafío
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
