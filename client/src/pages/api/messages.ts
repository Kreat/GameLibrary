// stores messages (not on a long-term database) for display on the chatroom page
// messages presently hardcoded

// NOTE
// gpt gave me two versions of this file
// I'm not really sure what either of them do (though they seem to be structurally similar)
// I'm leaving it for now, since the intention wasn't to actually populate the messages
// just get rid of the annoying error message
// which, success
// we'll need to rewrite this so it like ... actually displays messages

// NOTE - documenting dependencies
// I had to run this in shell to get it to work
// npm install next react react-dom

// version 1
import type { NextApiRequest, NextApiResponse } from "next";

let messages: any[] = []; // in-memory storage for demo purposes

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(messages);
  } else if (req.method === "POST") {
    const { content } = req.body;
    const newMessage = {
      id: messages.length + 1,
      content,
      senderId: "123", // can be made dynamic
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// version 2
// import type { NextApiRequest, NextApiResponse } from "next";

// type Message = {
//   id: number;
//   content: string;
//   senderId: string;
//   sender?: {
//     id: string;
//     username: string;
//     displayName: string | null;
//     photoUrl: string | null;
//   };
//   timestamp: string;
// };

// // Temporary in-memory store (will reset on server restart)
// let messages: Message[] = [
//   {
//     id: 1,
//     content: "Hello world!",
//     senderId: "user_123",
//     sender: {
//       id: "user_123",
//       username: "johndoe",
//       displayName: "John",
//       photoUrl: null,
//     },
//     timestamp: new Date().toISOString(),
//   },
// ];

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === "GET") {
//     return res.status(200).json(messages);
//   }

//   if (req.method === "POST") {
//     const { content } = req.body;

//     if (!content || typeof content !== "string") {
//       return res.status(400).json({ error: "Invalid content" });
//     }

//     const newMessage: Message = {
//       id: messages.length + 1,
//       content,
//       senderId: "user_123", // TODO: dynamically pull from session/auth
//       sender: {
//         id: "user_123",
//         username: "johndoe",
//         displayName: "John",
//         photoUrl: null,
//       },
//       timestamp: new Date().toISOString(),
//     };

//     messages.push(newMessage);
//     return res.status(201).json(newMessage);
//   }

//   return res.status(405).json({ error: "Method not allowed" });
// }
