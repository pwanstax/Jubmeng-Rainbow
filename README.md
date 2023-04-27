<h1 align="center">Pet Services Express API</h1>

<p align="center">
  <strong>An API built with Express.js for a pet services website.</strong>
</p>


## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)


## Description

This project is an API built with Express.js for a pet services website. The API provides endpoints for user authentication, product management, reviews, and user information.


## Installation

To get started with this project, you need to:

1. Clone this repository to your local machine
2. Install dependencies by running the following command: `yarn install`
3. Start the server with the following command: `yarn start`


## Usage

This API has the following features (27/4/23):

- User authentication with registration, login, and logout
- Product management with endpoints for creating, updating, and deleting products
- Review management with endpoints for creating and getting reviews
- User information management with endpoints for getting and updating user information


## API Endpoints

This API supports the following endpoints:

- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login a user
- `POST /auth/logout`: Logout current user
- `POST /auth/forgot-password`: Send reset link to email
- `POST /auth/reset-password`: Reset password
- `GET /auth/check-login`: Check if user is logged in
- `GET /products`: Get all products
- `POST /product`: Create a new product
- `GET /product/:id`: Get information for a product by ID
- `PATCH /product/:id`: Update a product by ID
- `DELETE /product/:id`: Delete a product by ID
- `GET /products/me/:username`: Get products for a specific user
- `GET /products/tags`: Get all product tags
- `GET /products/recommend`: Get recommended products based on user history
- `POST /review`: Create a new review
- `GET /review/:id`: Get reviews for a specific product by ID
- `GET /review-info/:id`: Get review information for a specific review by ID
- `GET /user/navbar`: Get user navbar information
- `PATCH /user/setseller/:id`: Set user as a seller
- `POST /user/info`: Get user information and add or update user information
- `PATCH /user/info`: Update user information
- `GET /user/save-for-later`: Get saved products for later
- `PATCH /user/save-for-later`: Add a product to saved products for later
- `DELETE /user/save-for-later`: Delete a product from saved products for later

This API is protected by authentication middleware that requires a valid JWT token and user's role to access certain routes.


## Contributing

Contributions are welcome! If you have any suggestions or find any issues, feel free to open an issue or submit a pull request.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

<p align="center">
<img src="https://images.unsplash.com/photo-1466921583968-f07aa80c526e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="" width="800">
</p>
