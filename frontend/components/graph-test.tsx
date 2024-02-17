"use client";
import { useEffect } from "react";
import Graph from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { redirect } from "next/navigation";

export const LoadGraph = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    // Adding nodes
    graph.addNode("first", {
      x: -3,
      y: 0,
      size: 20,
      label: "Node 1",
      color: "#FA4F40",
    });
    graph.addNode("second", {
      x: 3,
      y: 0,
      size: 20,
      label: "Node 2",
      color: "#58C9B9",
    });
    graph.addNode("third", {
      x: -1,
      y: 2,
      size: 20,
      label: "Node 3",
      color: "#F2C94C",
    });
    graph.addNode("fourth", {
      x: 1,
      y: -2,
      size: 20,
      label: "Node 4",
      color: "#9B51E0",
    });
    graph.addNode("fifth", {
      x: 0,
      y: -3,
      size: 20,
      label: "Node 5",
      color: "#EB5757",
    });
    graph.addNode("sixth", {
      x: -3,
      y: -3,
      size: 20,
      label: "Node 6",
      color: "#6FCF97",
    });
    graph.addNode("seventh", {
      x: 3,
      y: 3,
      size: 20,
      label: "Node 7",
      color: "#56CCF2",
    });
    graph.addNode("eighth", {
      x: 0,
      y: 4,
      size: 20,
      label: "Node 8",
      color: "#BB6BD9",
    });
    graph.addNode("ninth", {
      x: -4,
      y: 2,
      size: 20,
      label: "Node 9",
      color: "#333333",
    });
    graph.addNode("tenth", {
      x: 4,
      y: -2,
      size: 20,
      label: "Node 10",
      color: "#4D8FAC",
    });

    // Adding edges
    graph.addEdge("first", "second");
    graph.addEdge("first", "third");
    graph.addEdge("second", "fourth");
    graph.addEdge("third", "fifth");
    graph.addEdge("fourth", "fifth");
    graph.addEdge("sixth", "seventh");
    graph.addEdge("seventh", "eighth");
    graph.addEdge("eighth", "ninth");
    graph.addEdge("ninth", "tenth");
    graph.addEdge("tenth", "first");

    loadGraph(graph);
  }, [loadGraph]);
  console.log("loadGraph");
  return null;
};

export const DisplayGraph = () => {
  return (
    <div className="w-full h-full border">
      <SigmaContainer style={{ height: "100%", width: "100%" }}>
        <LoadGraph />
      </SigmaContainer>
    </div>
  );
};
