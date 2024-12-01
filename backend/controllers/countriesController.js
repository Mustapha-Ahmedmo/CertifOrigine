const sequelize = require('../config/db');

exports.getCountryInfo = async (req, res) => {
    const { id_list } = req.query; // Get `id_list` from query params
    try {
        // Query the database using the `get_country_info` function
        const [results] = await sequelize.query(
            'SELECT * FROM public.get_country_info(:id_list)',
            {
                replacements: { id_list: id_list || null }, // Send null if id_list is not provided
            }
        );

        res.status(200).json(results); // Return the results as JSON
    } catch (error) {
        console.error('Error fetching country info:', error);
        res.status(500).json({ message: 'Failed to fetch country info', error });
    }
};