"use client";

import { GetProjectSchema } from "@/lib/schema/projects";
import { useEffect, useState } from "react";
import { get } from "typed-handlers/client";

export default function ProjectsPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    get("/api/projects/[id]", {
      params,
      schema: GetProjectSchema,
    }).then(({ data }) => {
      console.log(data);
      setData(data);
    });
  }, []);

  return (
    <div>
      <h1>ID: {data?.id}</h1>
      <h1>Project: {data?.name}</h1>
      <p>{data?.description}</p>
    </div>
  );
}
