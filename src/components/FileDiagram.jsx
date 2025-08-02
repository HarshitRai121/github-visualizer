import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

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
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (repoData && repoData.length > 0) {
      return generateDiagram(repoData);
    }
    return { nodes: [], edges: [] };
  }, [repoData]);

  // Use the memoized values directly to initialize the state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // This effect is now only needed to handle updates to the diagram
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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