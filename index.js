import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const baseURL = "https://api.mangadex.org";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const quotes = [
  `"Human strength lies in the ability to change yourself."`,
  `"You can die any time, but living takes true courage."`,
  `"A person can change, at the moment when the person wishes to change."`,
  `"You will never be able to love anybody else until you love yourself."`,
  `"If you don't take risks, you can't create a future."`,
  `"If you don't share someone's pain, you can never understand them."`,
  `"There's no shame in falling down! True shame is to not stand up again!"`,
  `"The world isn't perfect. But it's there for us, doing the best it can…that's what makes it so damn beautiful."`,
  `"The past is the past. We cannot indulge ourselves in memories and destroy the present."`,
  `"We need to stop living for others. From now on…Let's live for ourselves!"`,
];

const speaker = [
  `- Saitama, One Punch Man`,
  `- Himura Kenshin, Rurouni Kenshin`,
  `- Fujioka Haruhi, Ouran Highschool Host Club`,
  `- Lelouch Lamperouge, Code Geass`,
  `- Monkey D. Luffy, One Piece`,
  `- Nagato, Naruto`,
  `- Midorima Shintaro, Kuroko's Basketball`,
  `- Roy Mustang, Full Metal Alchemist`,
  `- Murata Ken, Kyou Kara Maou!`,
  `- Historia Reiss, Attack on Titan`,
];

app.get("/", (req, res) => {
  const randomNumber = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomNumber];
  const randomSpeaker = speaker[randomNumber];

  res.render("index.ejs", { randomQuote, randomSpeaker });
});

app.get("/proxy-image", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("URL query parameter is required");
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching the image");
  }
});

app.post("/search-results", async (req, res) => {
  try {
    const response = await axios.get(
      baseURL + `/manga/?title=${req.body.userInquiry}&limit=30`
    );
    const results = response.data.data;

    const mangaData = await Promise.all(
      results.map(async (manga) => {
        let mangaID = manga.id;
        let relationships = manga.relationships;
        let cover = relationships.find((rel) => rel.type === "cover_art");
        let coverID = cover ? cover.id : null;
        let mangaTitle = manga.attributes.title.en;

        const imgResponse = await axios.get(baseURL + `/cover/${coverID}`);
        const fileName = imgResponse.data.data.attributes.fileName;
        const coverURL = `https://uploads.mangadex.org/covers/${mangaID}/${fileName}`;

        return {
          title: mangaTitle,
          mangaID,
          coverURL: `/proxy-image?url=${encodeURIComponent(coverURL)}`,
        };
      })
    );

    res.render("index.ejs", { data: mangaData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching data.");
  }
});

app.post("/recommendation", async (req, res) => {
  switch (req.body.genre) {
    case "random":
      var genreGUID = "0a39b5a1-b235-4886-a747-1d05d216532d";
      break;
    case "action":
      var genreGUID = "391b0423-d847-456f-aff0-8b0cfc03066b";
      break;
    case "adventure":
      var genreGUID = "87cc87cd-a395-47af-b27a-93258283bbc6";
      break;
    case "boyslove":
      var genreGUID = "5920b825-4181-4a17-beeb-9918b0ff7a30";
      break;
    case "comedy":
      var genreGUID = "4d32cc48-9f00-4cca-9b5a-a839f0764984";
      break;
    case "drama":
      var genreGUID = "b9af3a63-f058-46de-a9a0-e0c13906197a";
      break;
    case "fantasy":
      var genreGUID = "cdc58593-87dd-415e-bbc0-2ec27bf404cc";
      break;
    case "girlslove":
      var genreGUID = "a3c67850-4684-404e-9b7f-c69850ee5da6";
      break;
    case "horror":
      var genreGUID = "cdad7e68-1419-41dd-bdce-27753074a640";
      break;
    case "isekai":
      var genreGUID = "ace04997-f6bd-436e-b261-779182193d3d";
      break;
    case "mystery":
      var genreGUID = "ee968100-4191-4968-93d3-f82d72be7e46";
      break;
    case "psychological":
      var genreGUID = "3b60b75c-a2d7-4860-ab56-05f391bb889c";
      break;
    case "romance":
      var genreGUID = "423e2eae-a7a2-4a8b-ac03-a8351462d71d";
      break;
    case "sliceoflife":
      var genreGUID = "e5301a23-ebd9-49dd-a0cb-2add944c7fe9";
      break;
    case "sports":
      var genreGUID = "69964a64-2f90-4d33-beeb-f3ed2875eb4c";
      break;
  }

  async function getRecommendation() {
    try {
      const response = await axios.get(
        baseURL + `/manga/random/?includedTags[]=${genreGUID}`
      );
      const results = response.data.data;
      const mangaID = results.id;
      const relationships = results.relationships;
      const author = relationships.find((rel) => rel.type === "author");
      const cover = relationships.find((rel) => rel.type === "cover_art");
      const authorID = author ? author.id : null;
      const coverID = cover ? cover.id : null;

      const mangaTitle = results.attributes.title.en;
      const status = results.attributes.status;
      const tags = results.attributes.tags;
      const description = results.attributes.description.en;

      const authorSearch = await axios.get(baseURL + `/author/${authorID}`);
      const authorName = authorSearch.data.data.attributes.name;

      const imgResponse = await axios.get(baseURL + `/cover/${coverID}`);
      const fileName = imgResponse.data.data.attributes.fileName;
      const coverURL = `https://uploads.mangadex.org/covers/${mangaID}/${fileName}`;

      const mangaData = {
        title: mangaTitle,
        status,
        tags,
        description,
        authorName,
        coverURL: `/proxy-image?url=${encodeURIComponent(coverURL)}`,
      };

      res.render("index.ejs", { recommendation: mangaData });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error while fetching data.");
    }
  }

  getRecommendation();
});

app.post("/manga-details", async (req, res) => {
  let mangaID = req.body.mangaID;
  let coverURL = req.body.coverURL;

  async function getMangaDetails() {
    try {
      const response = await axios.get(baseURL + `/manga/${mangaID}`);
      const results = response.data.data;

      const mangaTitle = results.attributes.title.en;
      const status = results.attributes.status;
      const tags = results.attributes.tags;
      const description = results.attributes.description.en;

      const relationships = results.relationships;
      const author = relationships.find((rel) => rel.type === "author");
      const authorID = author ? author.id : null;

      const authorSearch = await axios.get(baseURL + `/author/${authorID}`);
      const authorName = authorSearch.data.data.attributes.name;

      const details = {
        title: mangaTitle,
        status,
        tags,
        description,
        authorName,
        coverURL,
      };

      res.render("manga-details.ejs", { details });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error while fetching data.");
    }
  }

  getMangaDetails();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
