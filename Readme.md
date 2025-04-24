# LLM Chatbot

## **Project Title: AI Chat with CoreGPT**  

### **Description**  
A fully functional AI-powered chat interface built with **React, Tailwind CSS, and Node.js** that interacts with the **ChatGPT API**.


## **Technologies Used**  

### **Frontend:**  
- React  
- Tailwind CSS  
- Vite  

### **Backend:**  
- Node.js  
- Express  
- OpenAI API
- Multer
  
  

## **Setup & Installation**  

### **1. Clone the Repository**  

```bash
git clone git@github.com:Ben2104/Chat-Bot.git
```
Navigate the Chat-Bot directory
```bash
  cd Chat-Bot
```

### **2. Set Up the Backend**  

Navigate to the backend folder:  

```bash
cd backend
```

Install dependencies:  

```bash
npm install
```
Create a .env file and add your OpenAI API key:
```bash
  touch .env
```
```
  OPENAI_API_KEY=your_api_key_here
  PORT=8000
```

Start the backend server:  

```bash
node index.js
```

### **3. Set Up the Frontend**  
Create another terminal and navigate to the client folder:  

```bash
cd client
```

Install dependencies:  

```bash
npm install
```

Run the development server:  

```bash
npm run dev
```


## **Features**  

✅ **Real-time Chat Interface** – Seamless conversation with AI.  
✅ **Interactive UI** – Clean and responsive interface built with Tailwind CSS.  
✅ **Fast Setup** – Get started in minutes with minimal setup.  
✅ **Modular Components** – Reusable and well-structured codebase.  
✅ **Error Handling** – Graceful handling of API failures and errors.  
✅ **URL Summarization** - Users can input a blog or article link, and the app will extract and summarize the content using OpenAI's GPT model.
