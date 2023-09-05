module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'User',
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
    { freezeTableName: true }
  )
}
