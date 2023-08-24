import { useEffect, useMemo, useRef } from "react";
import { MathfieldElement, Selector } from "mathlive";

export type MathEditorProps = {
  readOnly?: boolean;
  value: string;
  mfe?: MathfieldElement;
  onChange: (latex: string, prompts: Record<string, string>) => void;
  className?: string;
};
/**
 * @returns a styled math-editor as a non-controlled React component with placeholder support.
 */

const Mathfield = (props: MathEditorProps) => {
  //const [isScreenLarge] = useMediaQuery("(min-width: 768px)");

  const containerRef = useRef<HTMLDivElement>(null);
  console.log("RENDER mathlive");
  const mfe = useMemo(() => {
    const mathfield = props.mfe ?? new MathfieldElement();
    mathfield.virtualKeyboardTargetOrigin = "off";
    return mathfield;
  }, []);

  //mfe.readOnly = props.readOnly ?? true;
  //mfe.disabled = false;
  //const size = isScreenLarge ? 6 : 3;
  //const size = 6 ;

  //mfe.applyStyle({ fontSize: size as FontSize }, { operation: "set", range: [0, -1] });
  const currentValue = useRef<string>(""); // Esta variable se utilizará para realizar un seguimiento del valor actual del editor de matemáticas.

  useEffect(() => {
    // ejecuta un efecto secundario cuando el componente se monta por primera vez
    const container = containerRef.current!!;
    container.innerHTML = "";
    container.appendChild(mfe);
    mfe.className = props.className || "";
    mfe.mathVirtualKeyboardPolicy = "auto";
    mfe.readOnly = true;
    mfe.environmentPopoverPolicy = "off";

    /** 
    mfe.addEventListener("focusin", (evt) => {
      window.mathVirtualKeyboard.show()
    });
    */
    //mfe.addEventListener("keydown", (evt) =>  evt.preventDefault(), {capture: true});

    /*
    mfe.addEventListener("focusout", (evt) =>{
      window.mathVirtualKeyboard.hide()
    })
    */

    mfe.addEventListener(
      "keydown",
      ev => {
        if (ev.key === "\\") {
          ev.preventDefault();
          mfe.executeCommand(["insert", "\\backslash"]);
          console.log("tecla:", ev.key);
        } else if (ev.key === "Escape") ev.preventDefault();
        else if (ev.key === "Backspace" || ev.key === "Delete") {
          const currentContent = mfe.selection;
          console.log("Contenido actual:", currentContent);
        }
      },
      { capture: true },
    );

    mfe.addEventListener("input", evt => {
      //evt.preventDefault()
      const value = (evt.target as HTMLInputElement).value || "";
      const promptValues: Record<string, string> = mfe
        .getPrompts()
        .reduce((acc, id) => ({ ...acc, [id]: mfe.getPromptValue(id) }), {});
      if (currentValue.current !== value) {
        currentValue.current = value;
        props.onChange(value, promptValues);
      }
    });
  }, []);

  useEffect(() => {
    // Este efecto se encarga de actualizar el valor del editor de matemáticas cuando props.value cambia.

    if (currentValue.current !== props.value) {
      const position = mfe.position;
      mfe.setValue(props.value, { focus: true, feedback: false });
      mfe.position = position;
      currentValue.current = props.value;
    }
  }, [props.value]); //se ejecutará cada vez que el valor de props.value

  // @ts-ignore
  const showVirtualKeyboard = () => {
    mfe.executeCommand("toggleVirtualKeyboard" as Selector);
  };
  return (
    <>
      <div ref={containerRef} style={{ maxWidth: "100%" }} />
      {/**
         <ButtonGroup>
           <Button onClick={()=> {
             mfe.focus()
             mfe.executeCommand("moveToPreviousChar")
           }}>
             {'<'}
           </Button>
           <Button onClick={()=>{
             mfe.focus()
             mfe.executeCommand("moveToNextChar")
           }}>
             {'>'}
           </Button>
           <Button onClick={showVirtualKeyboard}>
             {'Toggle Keyboard'}
           </Button>
         </ButtonGroup>
         
         */}
    </>
  );
};

export default Mathfield;
