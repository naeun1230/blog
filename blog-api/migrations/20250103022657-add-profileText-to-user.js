'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('users', 'profileText', {
         type: Sequelize.STRING(200), // 최대 200자
         allowNull: true, // 필수 입력 아님
      })
   },

   down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('users', 'profileText')
   },
}
