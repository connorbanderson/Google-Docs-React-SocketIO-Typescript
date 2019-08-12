import React, { useState, useRef, useEffect } from "react";
import { initialValue } from "./slateInitialValue";
import Mitt from "mitt";
import uuid from "uuid";
import { Editor } from "slate-react";
import { Operation } from "slate";

interface Props {}

const emitter = new Mitt();

export const SyncingEditor: React.FC<Props> = () => {
  const [value, setValue] = useState(initialValue);
  const editorID: any = uuid.v4();
  const editorRef = useRef<Editor | null>(null);
  const remote = useRef(false);

  useEffect(() => {
    (emitter as any).on("*", (type: string, ops: Operation[]) => {
      if (editorID.current !== type) {
        remote.current = true;
        ops.forEach(op => editorID.current!.applyOperation(op));
        remote.current = false;
      }
    });
  }, []);

  return (
    <Editor
      ref={editorRef}
      value={value}
      style={{
        backgroundColor: "#FAFAFA",
        maxWidth: "800px",
        height: "250px",
        marginBottom: "20px"
      }}
      onChange={(opts: any) => {
        const ops = opts.operations
          .filter((o: any) => {
            if (o) {
              return (
                o.type !== "set_selection" &&
                o.type !== "set_value" &&
                (!o.data || !o.data.has("source"))
              );
            }
            return false;
          })
          .toJS()
          .map((o: any) => ({ ...o, data: { source: "one" } }));
        if (ops.length && !remote.current) {
          emitter.emit(editorID.current, ops);
        }
        setValue(opts.value);
      }}
    />
  );
};
