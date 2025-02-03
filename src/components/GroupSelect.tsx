import { Select } from "@chakra-ui/react";
import { useAuth } from "./Auth";
import { proxy } from "valtio";
import { useEffect } from "react";

export const gSelect = proxy<{
  group: string;
  hasGroup: boolean;
  onChange: boolean;
}>({
  group: "2",
  hasGroup: false,
  onChange: false,
});

export const GroupSelect = () => {
  const { isLoading, user } = useAuth();

  let gs: boolean = true;
  if (isLoading || !user || user.groups.length == 0) gs = false;
  useEffect(() => {
    if (gs) gSelect.group = user.groups[0].id;
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
            gSelect.group = e.target.value;
            gSelect.onChange = true;
          }}
        >
          {user.groups.map((group, i) => (
            <option key={"GroupSelectOption" + i} value={group.id}>
              Grupo: {group.label}
            </option>
          ))}
        </Select>
      ) : null}
    </>
  );
};
