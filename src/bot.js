require("dotenv").config();

const Discord = require("discord.js");

const { Client, WebhookClient, Attachment } = require("discord.js");
// const bot = new Client();

const client = new Client({
  partials: ["MESSAGE", "REACTION"],
});
// const client = new Discord.Client();

const webhookClient = new WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN
);

const prefix = "!";
const PREFIX = "$";

var queue = new Map();

const ytdl = require("ytdl-core");

var servers = {};

client.on("ready", () => {
  console.log(`${client.user.tag} has logged in.`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;

  // let args = message.content.substring(PREFIX.length).split(" ");
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    if (CMD_NAME === "kick") {
      if (!message.member.hasPermission("KICK_MEMBERS"))
        return message.reply("You do not have permissions to use that command");
      if (args.length === 0) return message.reply("Please provide an ID");
      const member = message.guild.members.cache.get(args[0]);
      if (member) {
        member
          .kick()
          .then((member) => message.channel.send(`${member} was kicked.`))
          .catch((err) => message.channel.send("I cannot kick that user :("));
      } else {
        message.channel.send("That member was not found");
      }
    } else if (CMD_NAME === "ban") {
      if (!message.member.hasPermission("BAN_MEMBERS"))
        return message.reply("You do not have permissions to use that command");
      if (args.length === 0) return message.reply("Please provide an ID");
      try {
        const user = await message.guild.members.ban(args[0]);
        message.channel.send("User was banned successfully");
      } catch (err) {
        console.log(err);
        message.channel.send(
          "An error occured. Either I do not have permissions or the user was not found"
        );
      }
    } else if (CMD_NAME === "announce") {
      console.log(args);
      const msg = args.join(" ");
      console.log(msg);
      webhookClient.send(msg);
    } else if (CMD_NAME === "play") {
      if (!args[0]) return;
      let url = args.join(" ");
      if (!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/))
        return message.channel.send("Please provide a valid Youtube link!");

      let serverQueue = queue.get(message.guild.id);
      let vc = message.member.voice;

      if (!vc) return message.channel.send("You are not in a voice channel!");

      if (
        !vc.channel.permissionsFor(client.user).has("CONNECT") ||
        !vc.channel.permissionsFor(client.user).has("SPEAK")
      )
        return message.channel.send("I do not have permission!");

      let songinfo = await ytdl.getInfo(url);
      let song = {
        title: songinfo.title,
        url: songinfo.video_url,
      };

      if (!serverQueue) {
        let queueConst = {
          textChannel: message.channel,
          voiceChannel: vc.channel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true,
        };

        queue.set(message.guild.id, queueConst);
        queueConst.songs.push(song);

        try {
          let connection = await vc.channel.join();
          queueConst.connection = connection;
          playSong(message.guild, queueConst.songs[0]);
        } catch (error) {
          console.log(error);
          queue.delete(message.guild.id);
          return message.channel.send(
            "There was an error playing the song! Error: " + error
          );
        }
      } else {
        serverQueue.songs.push(song);
        return message.channel.send(
          `${song.title} has been added to the queue!`
        );
      }
    }
    // else if (CMD_NAME === "play") {
    //   function play(connection, message) {
    //     var server = servers[message.guild.id];

    //     server.dispatcher = connection.playStream(
    //       ytdl(server.queue[0], { filter: "audioonly" })
    //     );

    //     server.queue.shift();

    //     server.dispatcher.on("end", function () {
    //       if (server.queue[0]) {
    //         play(connection, message);
    //       } else {
    //         connection.disconnect();
    //       }
    //     });
    //   }

    //   if (!args[1]) {
    //     message.channel.send("you need to provide a link!");
    //     return;
    //   }

    //   if (!message.member.voiceChannel) {
    //     message.channel.send("You must be in a channel to play the bot!");
    //     return;
    //   }

    //   if (!server[message.guild.id])
    //     servers[message.guild.id] = {
    //       queue: [],
    //     };

    //   var server = servers[message.guild.id];

    //   server.queue.push(args[1]);

    //   if (!message.guild.voiceConnection)
    //     message.member.voiceChannel.join().then(function (connection) {
    //       play(connection, message);
    //     });
    // }
    else if (CMD_NAME === "skip") {
      var server = servers[message.guild.id];
      if (server.dispatcher) server.dispatcher.end();
      message.channel.send("Skipping the song!");
    } else if (CMD_NAME === "stop") {
      if (message.guild.voiceConnection) {
        for (var i = server.queue.length - 1; i >= 0, i--; ) {
          server.queue.splice(i, 1);
        }
        server.dispatcher.end();
        message.channel.send("Ending the queue and leaving the voice channel!");
        console.log("stopped the queue");
      }
    }
  }
});

client.on("messageReactionAdd", (reaction, user) => {
  const { name } = reaction.emoji;
  const member = reaction.message.guild.members.cache.get(user.id);
  if (reaction.message.id === "738666523408990258") {
    switch (name) {
      case "🍎":
        member.roles.add("738664659103776818");
        break;
      case "🍌":
        member.roles.add("738664632838782998");
        break;
      case "🍇":
        member.roles.add("738664618511171634");
        break;
      case "🍑":
        member.roles.add("738664590178779167");
        break;
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  const { name } = reaction.emoji;
  const member = reaction.message.guild.members.cache.get(user.id);
  if (reaction.message.id === "738666523408990258") {
    switch (name) {
      case "🍎":
        member.roles.remove("738664659103776818");
        break;
      case "🍌":
        member.roles.remove("738664632838782998");
        break;
      case "🍇":
        member.roles.remove("738664618511171634");
        break;
      case "🍑":
        member.roles.remove("738664590178779167");
        break;
    }
  }
});

/**
 *
 * @param {Discord.Guild} guild
 * @param {Object} song
 */
async function playSong(guild, song) {
  let serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("end", () => {
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    })
    .on("error", () => {
      console.log(error);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(process.env.DISCORDJS_BOT_TOKEN);
