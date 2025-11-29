const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// folder location
const folderPath = path.join(__dirname, "data");
// file location
const filePath = path.join(__dirname, "data", "mock.data.json");

// Getting data
app.get("/", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (data.data.length < 1) {
      return res.status(400).json({ message: "Nothing saved yet" });
    }
    return res.status(200).json({ data: data.data });
  } catch (error) {
    return res.status(400).json({ message: "Nothing in there" });
  }
});

// Saving data
app.post("/", (req, res) => {
  const { name, amount, cost } = req.body;

  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ data: [] }));
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const existingData = data.data.find((i) => i.name === name);
    if (existingData) {
      return res.status(404).json({ message: "Such item alredy exists" });
    }

    data.data.push({
      name,
      amount,
      cost,
    });

    fs.writeFileSync(filePath, JSON.stringify(data));

    return res.status(200).json({ message: "Item is saved" });
  } catch (error) {
    return res.status(404).json({ message: "Can not save file" });
  }
});

app.put("/", (req, res) => {
  const { name, newName, amount, cost } = req.body;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    return res.status(404).json({ message: "Nothing saved in there" });
  }

  const item = data.data.find((i) => i.name === name);

  if (!item) {
    return res.status(404).json({ message: "No such item" });
  }

  if (newName !== undefined) item.name = newName;
  if (amount !== undefined) item.amount = amount;
  if (cost !== undefined) item.cost = cost;

  fs.writeFileSync(filePath, JSON.stringify(data));

  return res
    .status(200)
    .json({ message: "Item updated successfully", data: item });
});

// delete
app.delete("/", (req, res) => {
  const { name } = req.body;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const item = data.data.find((i) => i.name === name);
    if (!item) {
      return res.status(404).json({ message: "No such item" });
    }

    data.data = data.data.filter((i) => i.name !== name);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Nothing saved there" });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
