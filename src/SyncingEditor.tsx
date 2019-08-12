import React, { useState, useRef, useEffect } from "react";
import { initialValue } from "./slateInitialValue";
import uuid from "uuid";
import { Editor } from "slate-react";
import { Operation } from "slate";
import io from "socket.io-client";
import { identifier } from "@babel/types";

const socket = io("http://localhost:4000");

interface Props {}

export const SyncingEditor: React.FC<Props> = () => {
  const [value, setValue] = useState(initialValue);
  const id: any = useRef(`${uuid.v4()}`);
  const editorRef = useRef<Editor | null>(null);
  const remote = useRef(false);

  useEffect(() => {
    socket.on(
      "new-remote-operations",
      ({ editorID, ops }: { editorID: string; ops: string }) => {
        if (id.current !== editorID) {
          remote.current = true;
          JSON.parse(ops).forEach((op: any) =>
            editorRef.current!.applyOperation(op)
          );
          remote.current = false;
        }
      }
    );
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
          socket.emit("new-operations", {
            editorID: id.current,
            ops: JSON.stringify(ops)
          });
        }
        setValue(opts.value);
      }}
    />
  );
};
