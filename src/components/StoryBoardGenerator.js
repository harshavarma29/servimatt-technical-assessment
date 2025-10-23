import { Fragment, useEffect, useState, useRef } from 'react';
import styles from './StoryBoardGenerator.module.css';
import { experimental_generateImage as generateImage, streamText, stepCountIs, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import z from 'zod';

const openai = createOpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const tools = {
  generateImage: tool({
    description: 'Generate an image based on a text prompt',
    inputSchema: z.object({
        prompt: z.string().describe("Generate a four-panel storyboard image for"),
        style: z.string().optional().default('vivid'),
    }),
    execute: async ({ prompt }) => {
        const { image } = await generateImage({
        model: openai.imageModel('dall-e-3'),
        prompt,
        size: '1024x1024',
        providerOptions: {
          openai: { style: "vivid", quality: "standard" },
        },
      });
      return image.base64;
    },
    toModelOutput: () => ({
      type: 'content',
      value: [{ type: 'text', text: 'generated image in base64' }],
    }),
  }),
};

export const StoryBoardGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleStream = async (msgContext, visualPrompt) => {
    try {

        setLoadingMessage('Generating storyboard, this might take more than 10 seconds...');
        let finalPrompt = visualPrompt || msgContext.map(m => m.content).join('\n');

        const response = await streamText({
        model: openai.chat('gpt-4o-mini'),
        messages: [
            { role: 'system', content: "You are a storyboard visual designer. Turn the user's message into a short, vivid, visual description for a storyboard scene." },
            { role: 'user', content: finalPrompt }
        ],
        tools,
        stopWhen: stepCountIs(2),
        onChunk: (chunk) => {
          if (chunk.chunk.type === 'tool-result' && chunk.chunk.toolName === 'generateImage') {
            setLoadingMessage('Creating storyboard image...');
            
            const base64Image = chunk.chunk.output;
            setMessages((msgs) => [
              ...msgs,
              { role: 'assistant', type: 'image', content: `data:image/png;base64,${base64Image}` },
            ]);

            setLoadingMessage('');
          }

          if (chunk.chunk.type.startsWith('text')) {
            setMessages((msgs) => {
              const last = msgs[msgs.length - 1];
              if (last?.role === 'assistant' && !last?.content.startsWith('data:image/png')) {
                return [
                  ...msgs.slice(0, -1),
                  { ...last, content: last.content + (chunk.chunk.text ?? '') },
                ];
              } else {
                return [...msgs, { role: 'assistant', type: 'text', content: chunk.chunk.text ?? '' }];
              }
            });
          }
        },
      });

      await response.text;

      setLoadingMessage('');
    } catch (err) {
      console.error(err);
      setLoadingMessage('Something went wrong. Please check the console for more details.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const filteredHistory = messagesRef.current
        .filter(msg => msg.type !== 'image')
        .slice(-5);

    const updated = [
        ...filteredHistory,
        { role: 'user', type: 'text', content: prompt },
    ];

    setPrompt('');
    setMessages(prev => [...prev, updated.at(-1)]);

    const visualPrompt = `
        Convert this user message into a vivid storyboard scene description.
        Message: "${prompt}"
    `;
    handleStream(updated, visualPrompt);
  };

  return (
    <Fragment>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Storyboard Generator</h2>
        </div>

        <div className={`${styles.outputArea} ${styles.show}`}>
          {messages.map((msg, id) => (
            <Fragment key={id}>
              {msg.role === 'user' ? (
                <div className={styles.yourPrompt}>{msg.content}</div>
              ) : (
                <div className={styles.aiGenerated}>
                  {msg.type === 'image' ? (
                    <img
                      alt="Storyboard"
                      width={512}
                      height={512}
                      src={msg.content}
                    />
                  ) : (
                    <div className={styles.aiGeneratedContent}>{msg.content}</div>
                  )}
                </div>
              )}
            </Fragment>
          ))}

          {loadingMessage && (
            <div className={styles.loading}>
              <span>{loadingMessage}</span>
            </div>
          )}
        </div>

        <div className={styles.promptInputContainer}>
          <form onSubmit={handleSubmit}>
            <input
              className={styles.promptInput}
              type="text"
              placeholder="Describe your story idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className={styles.generateBtn}>Generate Storyboard</button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};
