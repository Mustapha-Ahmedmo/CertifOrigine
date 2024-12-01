const sequelize = require('../config/db');

exports.getSectorInfo = async (req, res) => {
    const { id_list } = req.query; // Fetch `id_list` from query parameters
    try {
        const [results] = await sequelize.query(
            'SELECT * FROM get_sector_info(CAST(:p_id_list AS TEXT))',
            {
                replacements: { p_id_list: id_list || null }, // Replace with null if id_list is not provided
            }
        );

        res.status(200).json(results); // Return results as JSON
    } catch (error) {
        console.error('Error fetching sector info:', error);
        res.status(500).json({ message: 'Error fetching sector info', error });
    }
};