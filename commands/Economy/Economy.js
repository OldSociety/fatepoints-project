const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js')
  
  module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
      .setName('economy')
      .setDescription('Create your economy account!'),
    async exectute(interaction) {
  
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Account')
        .setDescription(`Choose your option`)
        .addFields({ name: 'Create', value: `Create your account` })
        .addFields({ name: 'Delete', value: 'Delete your account' })
  
      const embed2 = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Created your account')
        .setDescription(`Account created`)
        .addFields({
          name: 'Success',
          value: `Your account has been successfully create! You have 7 silver and 30 copper upon creating your account.`,
        })
        .setFooter({ text: `Requested by ${interaction.user.username}` })
        .setTimestamp()
  
      const embed3 = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Deleted your account')
        .setDescription(`Account deleted`)
        .addFields({
          name: 'Success',
          value: `Your economy account has been successfully deleted.`,
        })
  
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(page1)
          .setEmoji('✅')
          .setLabel('Create')
          .setStyle(ButtonStyle, Success),
  
        new ButtonBuilder()
          .setCustomId(page1)
          .setEmoji('❌')
          .setLabel('Create')
          .setStyle(ButtonStyle, Success)
      )
  
      const message = await interaction.reply({
        embeds: [embed],
        components: [button],
      })
  
      const collector = await message.createMessageComponentCollector()
      collector.on('collect', async (i) => {
        if (i.customId == 'page1') {
          if (i.user.id !== interaction.user.id) {
            return i.reply({
              content: `Only ${interaction.user.tag} can use this button`,
              ephemeral: true,
            })
          }
  
          await Data.save()
  
          await i.update({ embeds: [embed2], components: [] })
        }
  
        if (i.customId == 'page2') {
          if (i.user.id !== interaction.user.id) {
            return i.reply({
              content: `Only ${interaction.user.tag} can use this button`,
              ephemeral: true,
            })
          }
  
          await Data.deleteMany()
  
          await i.update({ embeds: [embed3], components: [] })
        }
      })
    },
  }
  