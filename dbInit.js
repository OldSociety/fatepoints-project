const Sequelize = require('sequelize')
const sequelize = require('./Utils/sequelize')

const User = require('./Models/User.js')(sequelize, Sequelize.DataTypes)
const Shop = require('./Models/Shop.js')(sequelize, Sequelize.DataTypes)
const Enemy = require('./Models/Enemy.js')(sequelize, Sequelize.DataTypes)
const Character = require('./Models/Character.js')(
  sequelize,
  Sequelize.DataTypes
)
const MasterCharacter = require('./Models/MasterCharacter.js')(
  sequelize,
  Sequelize.DataTypes
)

// Model connections
User.hasMany(Character, {
  foreignKey: 'user_id',
  as: 'characters',
})

Character.belongsTo(User, {
  foreignKey: 'user_id',
})

Character.belongsTo(MasterCharacter, {
  foreignKey: 'master_character_id',
  as: 'masterCharacter',
})

MasterCharacter.hasMany(Character, {
  foreignKey: 'master_character_id',
  as: 'instances',
})

const shopData = require('./db/dbShop')
const characterData = require('./db/dbMasterCharacters')
const enemyData = require('./db/dbEnemies')

// Authenticates connection to the database.
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(console.error)

// Sync changes and populate database
sequelize
  .sync({ force: true })
  .then(async () => {
    const shopPromises = shopData.map((item) => Shop.upsert(item))
    const masterCharacterPromises = characterData.map(async (item) => {
      try {
        await MasterCharacter.upsert(item)
      } catch (error) {
        console.error('Error syncing MasterCharacter:', error)
      }
    })
    const enemyPromises = enemyData.map((item) => Enemy.upsert(item))

    console.log('User Associations:', Object.keys(User.associations))

    return Promise.all([
      ...shopPromises,
      ...masterCharacterPromises,
      ...enemyPromises,
    ])
  })
  .then(() => {
    console.log('All databases synced')
  })
  .catch((error) => {
    console.error('Error syncing databases:', error)
  })

module.exports = { User, Shop, Enemy }
