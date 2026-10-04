package com.example.freshmart

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.freshmart.ui.theme.FreshMartTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

private const val API_URL =
    "https://freshmart-shop-wuqc.onrender.com/api"

private const val WEBSITE_URL =
    "https://freshmart-shop-ciary.netlify.app/"

private val httpClient = OkHttpClient()

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            FreshMartTheme {
                FreshMartApp()
            }
        }
    }
}

data class Product(
    val id: Int,
    val name: String,
    val price: String
)

data class CartItem(
    val id: Int,
    val productId: Int,
    val productName: String,
    val price: String,
    val quantity: Int
)

@Composable
fun FreshMartApp() {

    var loggedIn by remember {
        mutableStateOf(false)
    }

    var accessToken by remember {
        mutableStateOf("")
    }

    if (loggedIn) {

        FreshMartHome(
            token = accessToken,
            onLogout = {
                accessToken = ""
                loggedIn = false
            }
        )

    } else {

        LoginScreen(
            onLoginSuccess = { token ->
                accessToken = token
                loggedIn = true
            }
        )
    }
}

@Composable
fun LoginScreen(
    onLoginSuccess: (String) -> Unit
) {

    var email by remember {
        mutableStateOf("")
    }

    var password by remember {
        mutableStateOf("")
    }

    var message by remember {
        mutableStateOf("")
    }

    var loading by remember {
        mutableStateOf(false)
    }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Text("FreshMart")

        Spacer(
            modifier = Modifier.height(30.dp)
        )

        OutlinedTextField(
            value = email,
            onValueChange = {
                email = it
            },
            label = {
                Text("Email")
            },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        OutlinedTextField(
            value = password,
            onValueChange = {
                password = it
            },
            label = {
                Text("Password")
            },
            visualTransformation =
                PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        Button(
            onClick = {

                if (
                    email.isBlank() ||
                    password.isBlank()
                ) {
                    message =
                        "Please enter your email and password."
                    return@Button
                }

                loading = true
                message = "Logging in..."

                scope.launch {

                    val result =
                        loginUser(
                            email,
                            password
                        )

                    loading = false

                    if (result.first) {

                        val token = result.second

                        val websiteUrl =
                            WEBSITE_URL +
                                "?mobile_token=" +
                                Uri.encode(token)

                        val intent = Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse(websiteUrl)
                        )

                        startActivity(intent)

                    } else {

                        message = result.second
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !loading
        ) {

            Text(
                if (loading)
                    "Please wait..."
                else
                    "Login"
            )
        }

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        Text(message)
    }
}

suspend fun loginUser(
    email: String,
    password: String
): Pair<Boolean, String> {

    return withContext(Dispatchers.IO) {

        try {

            val json = JSONObject()

            json.put(
                "email",
                email
            )

            json.put(
                "password",
                password
            )

            val body =
                json.toString()
                    .toRequestBody(
                        "application/json; charset=utf-8"
                            .toMediaType()
                    )

            val request =
                Request.Builder()
                    .url(
                        "$API_URL/auth/login"
                    )
                    .post(body)
                    .addHeader(
                        "Content-Type",
                        "application/json"
                    )
                    .build()

            val response =
                httpClient
                    .newCall(request)
                    .execute()

            val responseBody =
                response.body?.string()
                    ?: ""

            if (!response.isSuccessful) {

                return@withContext Pair(
                    false,
                    "Invalid email or password."
                )
            }

            val responseJson =
                JSONObject(responseBody)

            val tokens =
                responseJson.optJSONObject(
                    "tokens"
                )

            val token =
                tokens?.optString("access")
                    ?: ""

            if (token.isNotEmpty()) {

                Pair(
                    true,
                    token
                )

            } else {

                Pair(
                    false,
                    "Login succeeded but token was not received."
                )
            }

        } catch (e: Exception) {

            Pair(
                false,
                "Connection error: ${e.message}"
            )
        }
    }
}

/*
 * The functions below are kept from your previous Android app.
 * They are no longer used for the main login flow, but keeping them
 * here means we are not rebuilding or deleting your existing code.
 */

@Composable
fun FreshMartHome(
    token: String,
    onLogout: () -> Unit
) {

    var products by remember {
        mutableStateOf<List<Product>>(
            emptyList()
        )
    }

    var cartItems by remember {
        mutableStateOf<List<CartItem>>(
            emptyList()
        )
    }

    var showingCart by remember {
        mutableStateOf(false)
    }

    var message by remember {
        mutableStateOf("Loading...")
    }

    var loading by remember {
        mutableStateOf(true)
    }

    val scope = rememberCoroutineScope()

    suspend fun refreshAll() {

        loading = true

        val productResult =
            getProducts(token)

        if (productResult.first) {
            products = productResult.second
        }

        val cartResult =
            getCart(token)

        if (cartResult.first) {
            cartItems = cartResult.second
            message = ""
        } else {
            message = cartResult.third
        }

        loading = false
    }

    LaunchedEffect(Unit) {

        refreshAll()
    }

    if (showingCart) {

        CartScreen(
            cartItems = cartItems,
            token = token,
            onBack = {
                showingCart = false
            },
            onRefresh = {
                scope.launch {

                    val result =
                        getCart(token)

                    if (result.first) {
                        cartItems = result.second
                    }
                }
            }
        )

    } else {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement =
                    Arrangement.SpaceBetween,
                verticalAlignment =
                    Alignment.CenterVertically
            ) {

                Text("FreshMart")

                Row {

                    Button(
                        onClick = {
                            showingCart = true
                        }
                    ) {

                        Text(
                            "Cart (${cartItems.sumOf { it.quantity }})"
                        )
                    }
                }
            }

            Spacer(
                modifier = Modifier.height(16.dp)
            )

            Button(
                onClick = {
                    scope.launch {
                        refreshAll()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {

                Text("Refresh")
            }

            Spacer(
                modifier = Modifier.height(12.dp)
            )

            TextButton(
                onClick = onLogout
            ) {

                Text("Logout")
            }

            if (loading) {

                Text("Loading products...")

            } else if (products.isEmpty()) {

                Text(
                    message.ifEmpty {
                        "No products found."
                    }
                )

            } else {

                LazyColumn {

                    items(products) { product ->

                        ProductCard(
                            product = product,
                            token = token,
                            onAdded = {

                                scope.launch {

                                    val result =
                                        getCart(token)

                                    if (result.first) {
                                        cartItems =
                                            result.second
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProductCard(
    product: Product,
    token: String,
    onAdded: () -> Unit
) {

    var adding by remember {
        mutableStateOf(false)
    }

    var message by remember {
        mutableStateOf("")
    }

    val scope = rememberCoroutineScope()

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
    ) {

        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Text(
                text = product.name
            )

            Spacer(
                modifier = Modifier.height(6.dp)
            )

            Text(
                text = "KSh ${product.price}"
            )

            Spacer(
                modifier = Modifier.height(10.dp)
            )

            Button(
                onClick = {

                    adding = true

                    scope.launch {

                        val result =
                            addToCart(
                                token,
                                product.id
                            )

                        adding = false

                        if (result.first) {

                            message =
                                "Added to cart!"

                            onAdded()

                        } else {

                            message =
                                result.second
                        }
                    }
                },
                enabled = !adding
            ) {

                Text(
                    if (adding)
                        "Adding..."
                    else
                        "Add to Cart"
                )
            }

            if (message.isNotEmpty()) {

                Spacer(
                    modifier = Modifier.height(6.dp)
                )

                Text(message)
            }
        }
    }
}

@Composable
fun CartScreen(
    cartItems: List<CartItem>,
    token: String,
    onBack: () -> Unit,
    onRefresh: () -> Unit
) {

    var working by remember {
        mutableStateOf(false)
    }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement =
                Arrangement.SpaceBetween
        ) {

            Button(
                onClick = onBack
            ) {

                Text("Back")
            }

            Button(
                onClick = onRefresh
            ) {

                Text("Refresh")
            }
        }

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        Text("My Cart")

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        if (cartItems.isEmpty()) {

            Text("Your cart is empty.")

        } else {

            LazyColumn {

                items(
                    items = cartItems,
                    key = {
                        it.id
                    }
                ) { item ->

                    CartItemCard(
                        item = item,
                        token = token,
                        working = working,
                        onWorkingChange = {
                            working = it
                        },
                        onRefresh = onRefresh
                    )
                }
            }
        }
    }
}

@Composable
fun CartItemCard(
    item: CartItem,
    token: String,
    working: Boolean,
    onWorkingChange: (Boolean) -> Unit,
    onRefresh: () -> Unit
) {

    val scope = rememberCoroutineScope()

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
    ) {

        Column(
            modifier = Modifier.padding(16.dp)
        ) {

            Text(
                text = item.productName
            )

            Spacer(
                modifier = Modifier.height(6.dp)
            )

            Text(
                text = "KSh ${item.price}"
            )

            Spacer(
                modifier = Modifier.height(10.dp)
            )

            Row(
                verticalAlignment =
                    Alignment.CenterVertically
            ) {

                Button(
                    onClick = {

                        if (item.quantity <= 1) {

                            onWorkingChange(true)

                            scope.launch {

                                removeFromCart(
                                    token,
                                    item.id
                                )

                                onWorkingChange(false)

                                onRefresh()
                            }

                        } else {

                            onWorkingChange(true)

                            scope.launch {

                                updateCartQuantity(
                                    token,
                                    item.id,
                                    item.quantity - 1
                                )

                                onWorkingChange(false)

                                onRefresh()
                            }
                        }
                    },
                    enabled = !working
                ) {

                    Text("-")
                }

                Text(
                    text = "  ${item.quantity}  ",
                    modifier = Modifier.padding(
                        horizontal = 8.dp
                    )
                )

                Button(
                    onClick = {

                        onWorkingChange(true)

                        scope.launch {

                            updateCartQuantity(
                                token,
                                item.id,
                                item.quantity + 1
                            )

                            onWorkingChange(false)

                            onRefresh()
                        }
                    },
                    enabled = !working
                ) {

                    Text("+")
                }

                Spacer(
                    modifier = Modifier.weight(1f)
                )

                TextButton(
                    onClick = {

                        onWorkingChange(true)

                        scope.launch {

                            removeFromCart(
                                token,
                                item.id
                            )

                            onWorkingChange(false)

                            onRefresh()
                        }
                    },
                    enabled = !working
                ) {

                    Text("Remove")
                }
            }
        }
    }
}

suspend fun getProducts(
    token: String
): Pair<Boolean, List<Product>> {

    return withContext(Dispatchers.IO) {

        try {

            val request =
                Request.Builder()
                    .url(
                        "$API_URL/products/"
                    )
                    .get()
                    .addHeader(
                        "Authorization",
                        "Bearer $token"
                    )
                    .build()

            val response =
                httpClient
                    .newCall(request)
                    .execute()

            val body =
                response.body?.string()
                    ?: ""

            if (!response.isSuccessful) {

                return@withContext Pair(
                    false,
                    emptyList()
                )
            }

            val json =
                JSONArray(body)

            val list =
                mutableListOf<Product>()

            for (i in 0 until json.length()) {

                val item =
                    json.getJSONObject(i)

                list.add(
                    Product(
                        id =
                            item.optInt("id"),
                        name =
                            item.optString(
                                "name",
                                "Product"
                            ),
                        price =
                            item.optString(
                                "price",
                                "0"
                            )
                    )
                )
            }

            Pair(
                true,
                list
            )

        } catch (e: Exception) {

            Pair(
                false,
                emptyList()
            )
        }
    }
}

suspend fun getCart(
    token: String
): Triple<Boolean, List<CartItem>, String> {

    return withContext(Dispatchers.IO) {

        try {

            val request =
                Request.Builder()
                    .url(
                        "$API_URL/cart/"
                    )
                    .get()
                    .addHeader(
                        "Authorization",
                        "Bearer $token"
                    )
                    .build()

            val response =
                httpClient
                    .newCall(request)
                    .execute()

            val body =
                response.body?.string()
                    ?: ""

            if (!response.isSuccessful) {

                return@withContext Triple(
                    false,
                    emptyList(),
                    "Could not load cart."
                )
            }

            val root =
                JSONObject(body)

            val itemsJson =
                when {

                    root.has("items") ->
                        root.optJSONArray("items")

                    root.has("cart_items") ->
                        root.optJSONArray(
                            "cart_items"
                        )

                    else ->
                        JSONArray()
                }

            val list =
                mutableListOf<CartItem>()

            if (itemsJson != null) {

                for (
                    i in 0 until itemsJson.length()
                ) {

                    val item =
                        itemsJson
                            .getJSONObject(i)

                    val product =
                        item.optJSONObject(
                            "product"
                        )

                    val productId =
                        if (product != null) {
                            product.optInt("id")
                        } else {
                            item.optInt(
                                "product_id"
                            )
                        }

                    val name =
                        if (product != null) {
                            product.optString(
                                "name",
                                "Product"
                            )
                        } else {
                            item.optString(
                                "product_name",
                                "Product"
                            )
                        }

                    val price =
                        if (product != null) {
                            product.optString(
                                "price",
                                "0"
                            )
                        } else {
                            item.optString(
                                "price",
                                "0"
                            )
                        }

                    list.add(
                        CartItem(
                            id =
                                item.optInt("id"),
                            productId =
                                productId,
                            productName =
                                name,
                            price =
                                price,
                            quantity =
                                item.optInt(
                                    "quantity",
                                    1
                                )
                        )
                    )
                }
            }

            Triple(
                true,
                list,
                ""
            )

        } catch (e: Exception) {

            Triple(
                false,
                emptyList(),
                "Could not connect to cart."
            )
        }
    }
}

suspend fun addToCart(
    token: String,
    productId: Int
): Pair<Boolean, String> {

    return withContext(Dispatchers.IO) {

        try {

            val json =
                JSONObject()

            json.put(
                "product_id",
                productId
            )

            json.put(
                "quantity",
                1
            )

            val body =
                json.toString()
                    .toRequestBody(
                        "application/json; charset=utf-8"
                            .toMediaType()
                    )

            val request =
                Request.Builder()
                    .url(
                        "$API_URL/cart/items"
                    )
                    .post(body)
                    .addHeader(
                        "Authorization",
                        "Bearer $token"
                    )
                    .addHeader(
                        "Content-Type",
                        "application/json"
                    )
                    .build()

            val response =
                httpClient
                    .newCall(request)
                    .execute()

            if (response.isSuccessful) {

                Pair(
                    true,
                    "Added to cart."
                )

            } else {

                Pair(
                    false,
                    "Could not add item."
                )
            }

        } catch (e: Exception) {

            Pair(
                false,
                "Cart connection error."
            )
        }
    }
}

suspend fun updateCartQuantity(
    token: String,
    cartItemId: Int,
    quantity: Int
): Boolean {

    return withContext(Dispatchers.IO) {

        try {

            val json =
                JSONObject()

            json.put(
                "quantity",
                quantity
            )

            val body =
                json.toString()
                    .toRequestBody(
                        "application/json; charset=utf-8"
                            .toMediaType()
                    )

            val request =
                Request.Builder()
                    .url(
                        "$API_URL/cart/items/$cartItemId"
                    )
                    .patch(body)
                    .addHeader(
                        "Authorization",
                        "Bearer $token"
                    )
                    .addHeader(
                        "Content-Type",
                        "application/json"
                    )
                    .build()

            val response =
                httpClient
                    .newCall(request)
                    .execute()

            response.isSuccessful

        } catch (e: Exception) {

            false
        }
    }
}

suspend fun removeFromCart(
    token: String,
    cartItemId: Int
): Boolean {

    return withContext(Dispatchers.IO) {

        try {

            val request =
                Request.Builder()
                    .url(
                        "$API_URL/cart/items/$cartItemId"
                    )
                    .delete()
                    .addHeader(
                        "Authorization",
                        "Bearer $token"
                    )
                    .build()

            val response =
                httpClient
                    .newCall(request)
                    .execute()

            response.isSuccessful

        } catch (e: Exception) {

            false
        }
    }
}