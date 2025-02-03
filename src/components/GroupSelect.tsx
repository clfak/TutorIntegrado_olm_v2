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
  if (isLoading || !user || user.groups.length == 0) return <></>;

  useEffect(() => {
    if (isLoading || !user || user.groups.length == 0) gSelect.group = null;
    else gSelect.group = user.groups[0].id;
  }, []);

  return (
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
  );
};
