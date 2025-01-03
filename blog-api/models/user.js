const Sequelize = require('sequelize')

module.exports = class User extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            userid: {
               type: Sequelize.STRING(40),
               allowNull: false,
               unique: true,
            },
            password: {
               type: Sequelize.STRING(100),
               allowNull: false,
            },
            nick: {
               type: Sequelize.STRING(40),
               allowNull: false,
            },
            profile: {
               type: Sequelize.STRING(200),
               allowNull: true,
            },
            profileText: {
               // 프로필 문구 필드 추가
               type: Sequelize.STRING(200),
               allowNull: true, // 문구는 필수값이 아님
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.User.hasMany(db.Post, { foreignKey: 'UserId', sourceKey: 'id' })
      db.User.hasMany(db.Comment)
   }
}
