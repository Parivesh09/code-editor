// /client/src/pages/EditorPage.js
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { TextField, Grid } from '@mui/material';

const socket = io('http://localhost:5000');

const EditorPage = () => {
  const { projectId } = useParams();
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    socket.emit('joinRoom', { projectId });

    socket.on('codeUpdate', (code) => {
      setHtml(code.html);
      setCss(code.css);
      setJs(code.js);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${js}</script>
        </html>
      `);
      socket.emit('codeUpdate', { projectId, code: { html, css, js } });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [html, css, js, projectId]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <TextField
          fullWidth
          multiline
          label="HTML"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          multiline
          label="CSS"
          value={css}
          onChange={(e) => setCss(e.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          multiline
          label="JavaScript"
          value={js}
          onChange={(e) => setJs(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          frameBorder="0"
          width="100%"
          height="400px"
        />
      </Grid>
    </Grid>
  );
};

export default EditorPage;
