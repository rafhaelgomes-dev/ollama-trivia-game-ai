import axios from "axios";
import * as readline from "readline";

let score = 0;

const url = "http://localhost:11434/api/chat";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function startGame(theme: string) {
  const data = {
    model: "llama3.2:3b",
    messages: [
      {
        role: "user",
        content: `Vamos jogar trivia sobre ${theme}. Gere 5 perguntas e respostas no formato sem adicionais de comentários, apenas traga meu array de objetos: 
        [
          {
            pergunta: 
            resposta:
          }
        ]`,
      },
    ],
    stream: false,
  };

  console.log('Gerando perguntas...')

  axios
    .post(url, data)
    .then((response) => {
      const questionData = JSON.parse(response.data.message.content);

      console.log('gabarito >>', questionData)

      let currentQuestionIndex = 0;

      function askNextQuestion() {
        if (currentQuestionIndex < questionData.length) {
          const question = questionData[currentQuestionIndex].pergunta;
          const correctAnswer = questionData[currentQuestionIndex].resposta;

          console.log(`Pergunta: ${question}`);

          rl.question("Digite sua resposta: ", (userAnswer: string) => {
            checkAnswer(userAnswer, correctAnswer, askNextQuestion);
          });

          currentQuestionIndex++;
        } else {
          console.log(`Fim de jogo! Sua pontuação final é ${score} pontos.`);
          rl.close();
        }
      }

      askNextQuestion();
    })
    .catch((error) => {
      console.error("Erro ao começar o jogo:", error);
    });
}

function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  next: Function
) {
  console.log(`Resposta correta: ${correctAnswer}`);

  if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
    score += 10;
    console.log(`Correto! Sua pontuação agora é ${score} pontos.`);
  } else {
    console.log(`Resposta errada. A resposta correta era: "${correctAnswer}".`);
  }

  rl.question("Deseja continuar jogando? (s/n): ", (answer: string) => {
    if (answer.toLowerCase() === "s") {
      next();
    } else {
      console.log(`Fim de jogo! Sua pontuação final é ${score} pontos.`);
      rl.close();
    }
  });
}

rl.question(
  "Digite o tema do jogo (ex: História, Corrida, etc.): ",
  (chosenTheme: string) => {
    startGame(chosenTheme);
  }
);
