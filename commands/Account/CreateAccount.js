const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { DataTypes, Sequelize } = require('sequelize')
const sequelize = require('../../Utils/sequelize')
const {
  User,
  Character,
  MasterCharacter,
  UserGear,
} = require('../../Models/model.js')

const startingCharacterIds = [0, 1, 2]

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create your economy account'),
  async execute(interaction) {
    const userId = interaction.user.id
    const userName = interaction.user.username
    console.log(interaction.user)
    console.log("Storing username as: " + userName)
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
        // Create initial UserGear record
        await UserGear.create(
          {
            user_id: userId,
            // any other fields to initialize
          },
          { transaction: t }
        )

        await t.commit()

        return interaction.reply(
          `Your Hellbound: Wicked after Death account has been created with a balance of 730 gold. You've unlocked three new characters and they have begun scavenging for gear! Use /help for more information.`
        )
      } else {
        await t.rollback()
        return interaction.reply(
          `You already have an account. You currently have ${user.balance} gold in your account.`
        )
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
