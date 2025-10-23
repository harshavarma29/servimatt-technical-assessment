# AI Storyboard Generator

- Generates an image and a descriptive story based on the user’s text prompt using OpenAI’s GPT-4o-mini for text generation and DALL·E 3 for image generation.

## Tech Stack

- **Frontend:** React (with Module CSS)
- **AI SDK:** `@ai-sdk/react`, `@ai-sdk/openai`, `ai`, `zod`
- **Model:** GPT-4o-mini + DALL·E 3  

## Setup Instructions

### Clone the Repository

- git clone https://github.com/harshavarma29/servimatt-technical-assessment.git
- cd servimatt-technical-assessment

### Install Dependencies

- npm install

### Set Up Environment Variables

1) Create a .env file in the parent directory
2) Add the following variable: REACT_APP_OPENAI_API_KEY=your_openai_api_key

### Run the App

- npm start

Runs the app in the location http://localhost:3000 to view it in your browser.

### How it Works

1) Enter a short story idea or phrase in the input box.
2) GPT-4o-mini generates a short visual storyboard description.
3) DALL·E 3 creates a corresponding storyboard image.
4) The app displays appropriate loading indicators and error messages.

### Example Prompt

- Prompt: Biker escaping from a theft in the desert
- Result: The app generates a storyboard image along with a descriptive story.

## Acknowledgements

1) OpenAI – for GPT-4o and DALL·E models
2) React – for the UI framework
