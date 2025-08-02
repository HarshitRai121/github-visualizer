import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

// Move the style object outside the component to prevent re-creation
const nodeStyle = {
  padding: '10px',
  border: '1px solid #667EEA',
  borderRadius: '5px',
  backgroundColor: '#2D3748',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

// A simple function to generate nodes and edges from the GitHub tree
const generateDiagram = (tree) => {
  const initialNodes = [];
  const initialEdges = [];
  const positionMap = {};
  let yOffset = 50;

  tree.forEach((item) => {
    const pathParts = item.path.split('/');
    const name = pathParts[pathParts.length - 1];
    const isFolder = item.type === 'tree';

    const node = {
      id: item.path,
      type: 'default',
      position: { x: pathParts.length * 200, y: yOffset },
      data: { 
        label: (
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {isFolder ? '📁' : '📄'}
            </span>
            <span>{name}</span>
          </div>
        ),
        fileData: item 
      },
      style: nodeStyle,
    };
    initialNodes.push(node);
    positionMap[item.path] = { x: pathParts.length * 200, y: yOffset };

    yOffset += 70;

    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('/');
      initialEdges.push({
        id: `e-${parentPath}-${item.path}`,
        source: parentPath,
        target: item.path,
        animated: true,
      });
    }
  });

  const processedNodes = initialNodes.map(node => {
    const parentPath = node.id.split('/').slice(0, -1).join('/');
    const parentPosition = positionMap[parentPath];
    if (parentPosition) {
      return {
        ...node,
        position: { x: parentPosition.x + 200, y: node.position.y },
      };
    }
    return node;
  });

  return { nodes: processedNodes, edges: initialEdges };
};

const FileDiagram = ({ repoData, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesState] = useEdgesState([]);

  useEffect(() => {
    if (repoData && repoData.length > 0) {
      const { nodes, edges } = generateDiagram(repoData);
      setNodes(nodes);
      setEdges(edges);
    }
  }, [repoData, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesState}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default FileDiagram;