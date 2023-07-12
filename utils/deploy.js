const fs = require('fs');
const firefoxDeploy = require('firefox-extension-deploy');
const shell = require('shelljs');
require('dotenv').load();
const Discord = require('discord.js');

const deployData = JSON.parse(fs.readFileSync("deploy_data.json", "utf8"));
const firefoxZipPath = `./dist/firefox/prod/${deployData.firefox}`;

console.log("Pushing commits to master...");
shell.exec("git push origin master");

console.log("Pushing tags...");
shell.exec("git push --tags");

console.log(`Deploying version ${deployData.version} for:`);

if(typeof (deployData.firefox) !== "undefined") {
  console.log(`  Firefox: ${deployData.firefox}`);

  firefoxDeploy({
    issuer: process.env.FIREFOX_ISSUER,
    secret: process.env.FIREFOX_SECRET,

    id: "{ffed5dfa-f0e1-403d-905d-ac3f698660a7}",
    version: deployData.version,
    src: fs.createReadStream(firefoxZipPath),
  }).then(() => {
    console.log("Firefox: success!");
  }, (err) => {
    console.log("Firefox error");
    console.log(err);
  });
}

{
  const client = new Discord.Client();

  let changelog = null;
  try {
    changelog = JSON.parse(fs.readFileSync("changelog.json", "utf8", e => {
      if (e) console.log(e);
    }));
  } catch (err) {
    console.log(`Failed to get changelog, exiting: ${err}`);
    process.exit(1);
  }

  let latestChanges = changelog.versions[changelog.current];
  if (!latestChanges) {
    console.log("Couldn't find latest changes.");
    process.exit(1);
  }

  client.on("ready", async () => {
    const channel = await client.channels.fetch('495911561181790208');
    if(!channel) {
      console.log("couldn't find discord chanel");
      return;
    }

    const noMedia = !latestChanges.info.media || latestChanges.info.media.length <=0;

    let strBuffer = `**${changelog.current} - ${latestChanges.info.title}**\n`;
    if(!noMedia) {
      strBuffer += `https://justas-d.github.io/roll20-enhancement-suite/${latestChanges.info.media}\n`;
    }

    latestChanges.changes.forEach(c => {
      strBuffer += `• ${c.content}\n`;
    });

    await channel.send(strBuffer);

    client.destroy();
  });

  client.login(process.env.DISCORD_TOKEN);
}
