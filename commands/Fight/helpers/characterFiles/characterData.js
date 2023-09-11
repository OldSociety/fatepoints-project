// CharacterData.js

const { Character, MasterCharacter } = require('../../../Models/models')
const LevelUp = require('./levelUpSystem')

class CharacterData {
  static async initCharacter(masterCharacterId, userId) {
    // Initialize character based on MasterCharacter
    const masterCharacter = await MasterCharacter.findByPk(masterCharacterId)

    // Check if the master character exists
    if (!masterCharacter) {
      throw new Error('MasterCharacter not found')
    }

    // Character health calculation
    const artifice_health_modifier = 1
    const level_health_modifier = 1
    const rank_health_modifier = 1
    const support_health_modifier = 1

    const character_health = Math.floor(
      (masterCharacter.dataValues.base_health + artifice_health_modifier) *
        (level_health_modifier * rank_health_modifier * support_health_modifier)
    )

    // Character damage calculation
    const artifice_damage_modifier = 1
    const level_damage_modifier = 1
    const rank_damage_modifier = 1
    const support_damage_modifier = 1

    const character_damage = Math.floor(
      (masterCharacter.dataValues.base_damage + artifice_damage_modifier) *
        (level_damage_modifier * rank_damage_modifier * support_damage_modifier)
    )

    // Create a new instance of Character and save it
    const newCharacter = await Character.create({
      userId: userId,
      masterCharacterId: masterCharacterId,
      health: character_health,
      damage: character_damage,
      // ... any other fields
    })

    if (!newCharacter) {
      throw new Error('Failed to create new character')
    }

    return newCharacter
  }

  static async updateHealth(characterId, change) {
    // Fetch the character
    const character = await Character.findByPk(characterId)

    if (!character) {
      throw new Error('Character not found')
    }

    // Update the health
    character.health += change
    await character.save()
  }

  // Add more methods related to individual characters
}

module.exports = CharacterData
