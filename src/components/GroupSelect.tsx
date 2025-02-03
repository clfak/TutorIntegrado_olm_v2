import { Select } from "@chakra-ui/react";
import { useAuth } from "./Auth";
import { proxy } from "valtio";
import { useEffect } from "react";

interface group {
  id: string;
  code: string;
  label: string;
  tags: Array<string>;
}

export const gSelect = proxy<{
  group?: group;
  hasGroup: boolean;
  onChange: boolean;
}>({
  group: null,
  hasGroup: false,
  onChange: false,
});

export const GroupSelect = () => {
  const { isLoading, user } = useAuth();

  let gs: boolean = true;
  if (isLoading || !user || user.groups.length == 0) gs = false;
  useEffect(() => {
    if (gs) gSelect.group = user.groups[0] as group;
    else gSelect.group = null;
  }, [user]);

  return (
    <>
      {gs ? (
        <Select
          size={"sm"}
          color="black"
          bg="white"
          onChange={e => {
            gSelect.group = user.groups[Number(e.target.value)] as group;
            gSelect.onChange = true;
          }}
        >
          {user.groups.map((group, i) => (
            <option key={"GroupSelectOption" + i} value={"" + i}>
              Grupo: {group.label}
            </option>
          ))}
        </Select>
      ) : null}
    </>
  );
};
