import { useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

export default function App() {
  const [friends, setFriends] = useState(initialFriends);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);

  function handleAddFriend(friend) {
    setFriends((currentFriends) => [...currentFriends, friend]);
    setShowAddFriend(false);
  }

  function handleSelectFriend(friend) {
    setSelectedFriend((currentFriend) =>
      currentFriend?.id === friend.id ? null : friend,
    );
  }

  function handleSplitBill(balanceChange) {
    setFriends((currentFriends) =>
      currentFriends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + balanceChange }
          : friend,
      ),
    );
    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={handleSelectFriend}
        />
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}
        <Button onClick={() => setShowAddFriend((show) => !show)}>
          {showAddFriend ? "Close" : "Add friend"}
        </Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          key={selectedFriend.id}
          friend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

function FriendsList({ friends, selectedFriend, onSelectFriend }) {
  return (
    <ul>
      {friends.map((friend) => (
        <li
          className={selectedFriend?.id === friend.id ? "selected" : ""}
          key={friend.id}
        >
          <img src={friend.image} alt={friend.name} />
          <h3>{friend.name}</h3>
          {friend.balance < 0 && (
            <p className="red">
              You owe {friend.name} ${Math.abs(friend.balance)}
            </p>
          )}
          {friend.balance > 0 && (
            <p className="green">
              {friend.name} owes you ${Math.abs(friend.balance)}
            </p>
          )}
          {friend.balance === 0 && <p>You and {friend.name} are even</p>}
          <Button onClick={() => onSelectFriend(friend)}>
            {selectedFriend?.id === friend.id ? "Close" : "Select"}
          </Button>
        </li>
      ))}
    </ul>
  );
}

function Button({ children, onClick, type = "button" }) {
  return (
    <button className="button" onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageError, setImageError] = useState("");

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setUploadedImage(reader.result);
      setImageError("");
    });
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    let image = uploadedImage;
    const trimmedImageUrl = imageUrl.trim();
    if (!image && trimmedImageUrl) {
      if (
        trimmedImageUrl.startsWith("/") ||
        trimmedImageUrl.startsWith("~") ||
        /^[a-z]:\\/i.test(trimmedImageUrl)
      ) {
        setImageError("Choose a local image with the file picker below.");
        return;
      }

      const normalizedUrl = /^https?:\/\//i.test(trimmedImageUrl)
        ? trimmedImageUrl
        : `https://${trimmedImageUrl}`;
      try {
        const parsedUrl = new URL(normalizedUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          throw new Error("Unsupported image URL");
        }
        image = normalizedUrl;
      } catch {
        setImageError("Enter a valid image URL or choose an image file.");
        return;
      }
    }

    onAddFriend({
      id: `${Date.now()}-${Math.random()}`,
      name: trimmedName,
      image:
        image ||
        `https://i.pravatar.cc/48?u=${encodeURIComponent(trimmedName)}`,
      balance: 0,
    });
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label htmlFor="friend-name">👫 Friend name</label>
      <input
        id="friend-name"
        onChange={(event) => setName(event.target.value)}
        required
        type="text"
        value={name}
      />
      <label htmlFor="friend-image">🌄 Image URL (optional)</label>
      <input
        id="friend-image"
        onChange={(event) => {
          setImageUrl(event.target.value);
          setImageError("");
        }}
        placeholder="https://example.com/image.jpg"
        type="text"
        value={imageUrl}
      />
      <label htmlFor="friend-image-file">Or choose an image</label>
      <input
        accept="image/*"
        id="friend-image-file"
        onChange={handleImageUpload}
        type="file"
      />
      {imageError && (
        <p className="image-error" role="alert">
          {imageError}
        </p>
      )}
      <Button type="submit">Add</Button>
    </form>
  );
}

function FormSplitBill({ friend, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [yourExpense, setYourExpense] = useState("");
  const [whoIsPaying, setWhoIsPaying] = useState("you");
  const friendExpense =
    bill === "" || yourExpense === ""
      ? ""
      : Math.max(0, Number(bill) - Number(yourExpense));

  function handleSubmit(event) {
    event.preventDefault();
    const billAmount = Number(bill);
    const amountYouPaid = Number(yourExpense);
    if (
      bill === "" ||
      yourExpense === "" ||
      billAmount <= 0 ||
      amountYouPaid < 0 ||
      amountYouPaid > billAmount
    ) {
      return;
    }

    const balanceChange =
      whoIsPaying === "you" ? billAmount - amountYouPaid : -amountYouPaid;
    onSplitBill(Math.round(balanceChange * 100) / 100);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {friend.name}</h2>
      <label htmlFor="bill-value">💰 Bill value</label>
      <input
        id="bill-value"
        min="0.01"
        onChange={(event) => setBill(event.target.value)}
        required
        step="0.01"
        type="number"
        value={bill}
      />
      <label htmlFor="your-expense">🧍 Your expense</label>
      <input
        id="your-expense"
        max={bill || undefined}
        min="0"
        onChange={(event) => setYourExpense(event.target.value)}
        required
        step="0.01"
        type="number"
        value={yourExpense}
      />
      <label htmlFor="friend-expense">🧑‍🤝‍🧑 {friend.name}'s expense</label>
      <input id="friend-expense" readOnly type="number" value={friendExpense} />
      <label htmlFor="bill-payer">💵 Who is paying the bill</label>
      <select
        id="bill-payer"
        onChange={(event) => setWhoIsPaying(event.target.value)}
        value={whoIsPaying}
      >
        <option value="you">You</option>
        <option value="friend">{friend.name}</option>
      </select>
      <Button type="submit">Split bill</Button>
    </form>
  );
}
