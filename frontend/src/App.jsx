import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api/menu";

const emptyForm = {
    name: "",
    category: "",
    price: "",
    availability: true,
    description: ""
};

function App() {
    const [menuItems, setMenuItems] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadMenu = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load menu.");
            }

            const data = await response.json();
            setMenuItems(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenu();
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!form.name.trim()) {
            setError("Dish name is required.");
            return;
        }

        if (!form.category.trim()) {
            setError("Category is required.");
            return;
        }

        if (form.price === "" || Number(form.price) < 0) {
            setError("Please enter a valid price.");
            return;
        }

        try {
            setSaving(true);

            const url = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Request failed.");
            }

            if (editingId) {
                setMessage("Menu item updated successfully.");
            } else {
                setMessage("Menu item added successfully.");
            }

            setForm(emptyForm);
            setEditingId(null);

            await loadMenu();
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);

        setForm({
            name: item.name,
            category: item.category,
            price: item.price,
            availability: Boolean(item.availability),
            description: item.description || ""
        });

        setError("");
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this menu item?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete item.");
            }

            setMessage("Menu item deleted successfully.");

            await loadMenu();
        } catch (error) {
            setError(error.message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setMessage("");
    };

    return (
        <div className="app">
            <header className="header">
                <div>
                    <p className="eyebrow">CANTEEN MANAGEMENT</p>
                    <h1>Canteen Menu Manager</h1>
                    <p className="subtitle">
                        Manage dishes, prices, categories, and availability.
                    </p>
                </div>

                <div className="menu-count">
                    <strong>{menuItems.length}</strong>
                    <span>Menu Items</span>
                </div>
            </header>

            <main className="container">
                <section className="form-card">
                    <div className="section-heading">
                        <div>
                            <h2>{editingId ? "Edit Dish" : "Add New Dish"}</h2>
                            <p>
                                {editingId
                                    ? "Update the selected menu item."
                                    : "Enter the details of a new canteen dish."}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="alert error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="alert success">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="field">
                                <label>Dish Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Chicken Burger"
                                />
                            </div>

                            <div className="field">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select category</option>
                                    <option value="Burger">Burger</option>
                                    <option value="Rice Meals">Rice Meals</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Drinks">Drinks</option>
                                    <option value="Dessert">Dessert</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="field">
                                <label>Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="field availability-field">
                                <label>Availability</label>

                                <label className="switch-label">
                                    <input
                                        type="checkbox"
                                        name="availability"
                                        checked={form.availability}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        {form.availability
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>
                                </label>
                            </div>

                            <div className="field full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the dish..."
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Dish"
                                    : "Add Dish"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="list-section">
                    <div className="section-heading">
                        <div>
                            <h2>Menu List</h2>
                            <p>All dishes currently stored in the database.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="state-box">
                            Loading menu items...
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="state-box">
                            No menu items found.
                        </div>
                    ) : (
                        <div className="menu-grid">
                            {menuItems.map((item) => (
                                <article
                                    className="menu-card"
                                    key={item.id}
                                >
                                    <div className="card-top">
                                        <span className="category">
                                            {item.category}
                                        </span>

                                        <span
                                            className={
                                                item.availability
                                                    ? "status available"
                                                    : "status unavailable"
                                            }
                                        >
                                            {item.availability
                                                ? "Available"
                                                : "Unavailable"}
                                        </span>
                                    </div>

                                    <h3>{item.name}</h3>

                                    <div className="price">
                                        ₱{Number(item.price).toFixed(2)}
                                    </div>

                                    <p className="description">
                                        {item.description ||
                                            "No description provided."}
                                    </p>

                                    <div className="card-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;