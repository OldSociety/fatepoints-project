const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../Utils/sequelize')
const {
  User,
  Character,
  MasterCharacter,
  UserGear,
  GearParts,
  UserGearParts,
} = require('../../Models/model.js')

const startingCharacterIds = [0, 1, 2]
const startingGearParts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('Create your economy account'),
  async execute(interaction) {
    const userId = interaction.user.id
    const userName = interaction.user.username
    const t = await sequelize.transaction()

    try {
      const [user, created] = await User.findOrCreate({
        where: { user_id: userId },
        defaults: { balance: 730, user_name: userName },

        transaction: t,
      })

      if (created) {
        await Promise.all(
          startingCharacterIds.map((id) => {
            return Character.create(
              {
                user_id: userId,
                master_character_id: id,
              },
              { transaction: t }
            )
          })
        )

        const gearPartsDetails = await GearParts.findAll({
          where: { parts_id: startingGearParts }
        });
        
        if (!gearPartsDetails || gearPartsDetails.length === 0) {
          throw new Error('Failed to fetch gear parts details')
        }

        // Create initial UserGear record
        await Promise.all(
          gearPartsDetails.map((part) => {
            return UserGearParts.create(
              {
                user_id: userId,
                parts_id: part.parts_id,
                rarity: part.rarity,
              },
              { transaction: t }
            )
          })
        )
        await t.commit()

        const color = parseInt('0099ff', 16)
        const embedReset = new EmbedBuilder()
          .setDescription(
            `Your Hellbound: Wicked after Death account has been created with a balance of 730 gold. You've unlocked three new characters and they have begun scavenging for gear! Use /help for more information.`
          )
          .setColor(color)

        await interaction.reply({
          embeds: [embedReset],
          ephemeral: true,
        })
      } else {
        await t.rollback()
       
        const color = parseInt('0099ff', 16)
        const embedReset = new EmbedBuilder()
          .setDescription(
            `You already have an account. You currently have **${user.balance} gold** in your account.`
          )
          .setColor(color)

        await interaction.reply({
          embeds: [embedReset],
          ephemeral: true,
        })
      }
    } catch (error) {
      await t.rollback()
      console.error('Error in execute:', error)
      return interaction.reply(
        'Something went wrong while creating your account.'
      )
    }
  },
}
