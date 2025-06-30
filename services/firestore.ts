import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { Product, User, Order, Cart, OrderStatus, ProductStatus, Message } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const snap = await getDocs(collection(firestore, 'products'));
    return snap.docs
      .map((d) => d.data() as Product)
      .filter((p) => p.status === ProductStatus.LIVE);
  } catch (e) {
    console.error('getProducts failed', e);
    return [];
  }
};

export const getProductsBySeller = async (
  sellerId: string,
): Promise<Product[]> => {
  try {
    const snap = await getDocs(collection(firestore, 'products'));
    return snap.docs
      .map((d) => d.data() as Product)
      .filter((p) => p.sellerId === sellerId);
  } catch (e) {
    console.error('getProductsBySeller failed', e);
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(firestore, 'products', productId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Product) : null;
  } catch (e) {
    console.error('getProductById failed', e);
    return null;
  }
};

export const addProduct = async (
  product: Omit<Product, 'id'>,
): Promise<Product | null> => {
  try {
    const data = {
      currency: 'USD',
      status: ProductStatus.DRAFT,
      ...product,
    };
    const docRef = await addDoc(collection(firestore, 'products'), data);
    await updateDoc(docRef, { id: docRef.id });
    const snap = await getDoc(docRef);
    return snap.data() as Product;
  } catch (e) {
    console.error('addProduct failed', e);
    return null;
  }
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Product>,
): Promise<Product | null> => {
  try {
    const docRef = doc(firestore, 'products', productId);
    await updateDoc(docRef, updates);
    const snap = await getDoc(docRef);
    return snap.data() as Product;
  } catch (e) {
    console.error('updateProduct failed', e);
    return null;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(firestore, 'products', productId));
    return true;
  } catch (e) {
    console.error('deleteProduct failed', e);
    return false;
  }
};

export const loginUser = async (email: string): Promise<User | null> => {
  try {
    const name = email.split('@')[0];
    const querySnap = await getDocs(collection(firestore, 'users'));
    const users = querySnap.docs
      .map((d) => d.data() as User)
      .filter((u) => u.email === email);
    let user = users[0];
    if (!user) {
      const ref = await addDoc(collection(firestore, 'users'), {
        email,
        name,
        profilePicUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
        roles: [],
      });
      await updateDoc(ref, { id: ref.id });
      const snap = await getDoc(ref);
      user = snap.data() as User;
    }
    return user;
  } catch (e) {
    console.error('loginUser failed', e);
    return null;
  }
};

export const updateUser = async (user: User): Promise<User | null> => {
  try {
    const ref = doc(firestore, 'users', user.id);
    await setDoc(ref, user, { merge: true });
    const snap = await getDoc(ref);
    return snap.data() as User;
  } catch (e) {
    console.error('updateUser failed', e);
    return null;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const snap = await getDoc(doc(firestore, 'users', userId));
    return snap.exists() ? (snap.data() as User) : null;
  } catch (e) {
    console.error('getUserById failed', e);
    return null;
  }
};

export const getCart = async (userId: string): Promise<Cart> => {
  try {
    const ref = doc(firestore, 'carts', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as Cart;
    }
    const cart: Cart = { userId, productIds: [] };
    await setDoc(ref, cart);
    return cart;
  } catch (e) {
    console.error('getCart failed', e);
    return { userId, productIds: [] };
  }
};

export const addToCart = async (userId: string, productId: string): Promise<Cart> => {
  try {
    const cart = await getCart(userId);
    if (!cart.productIds.includes(productId)) {
      cart.productIds.push(productId);
    }
    await setDoc(doc(firestore, 'carts', userId), cart);
    return cart;
  } catch (e) {
    console.error('addToCart failed', e);
    return { userId, productIds: [] };
  }
};

export const removeFromCart = async (
  userId: string,
  productId: string,
): Promise<Cart> => {
  try {
    const cart = await getCart(userId);
    cart.productIds = cart.productIds.filter((id) => id !== productId);
    await setDoc(doc(firestore, 'carts', userId), cart);
    return cart;
  } catch (e) {
    console.error('removeFromCart failed', e);
    return { userId, productIds: [] };
  }
};

export const clearCart = async (userId: string): Promise<Cart> => {
  try {
    const cart = { userId, productIds: [] };
    await setDoc(doc(firestore, 'carts', userId), cart);
    return cart;
  } catch (e) {
    console.error('clearCart failed', e);
    return { userId, productIds: [] };
  }
};

export const createOrder = async (
  buyerId: string,
  items: { productId: string; price: number }[],
): Promise<Order | null> => {
  try {
    const ref = await addDoc(collection(firestore, 'orders'), {
      buyerId,
      items,
      purchaseDate: new Date().toISOString(),
      status: OrderStatus.PAID,
    });
    await updateDoc(ref, { id: ref.id });
    await deleteDoc(doc(firestore, 'carts', buyerId));
    const snap = await getDoc(ref);
    return snap.data() as Order;
  } catch (e) {
    console.error('createOrder failed', e);
    return null;
  }
};

export const getOrdersByBuyer = async (buyerId: string): Promise<Order[]> => {
  try {
    const snap = await getDocs(collection(firestore, 'orders'));
    return snap.docs
      .map((d) => d.data() as Order)
      .filter((o) => o.buyerId === buyerId);
  } catch (e) {
    console.error('getOrdersByBuyer failed', e);
    return [];
  }
};

export const getOrdersBySeller = async (sellerId: string): Promise<Order[]> => {
  try {
    const prodSnap = await getDocs(collection(firestore, 'products'));
    const sellerProductIds = prodSnap.docs
      .map((d) => d.data() as Product)
      .filter((p) => p.sellerId === sellerId)
      .map((p) => p.id);
    const ordersSnap = await getDocs(collection(firestore, 'orders'));
    return ordersSnap.docs
      .map((d) => d.data() as Order)
      .filter((o) => o.items.some((i) => sellerProductIds.includes(i.productId)));
  } catch (e) {
    console.error('getOrdersBySeller failed', e);
    return [];
  }
};

export const sendMessage = async (message: Omit<Message, 'id'>): Promise<Message | null> => {
  try {
    const ref = await addDoc(collection(firestore, 'messages'), message);
    await updateDoc(ref, { id: ref.id });
    const snap = await getDoc(ref);
    return snap.data() as Message;
  } catch (e) {
    console.error('sendMessage failed', e);
    return null;
  }
};

export const getMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  try {
    const snap = await getDocs(collection(firestore, 'messages'));
    return snap.docs
      .map((d) => d.data() as Message)
      .filter((m) =>
        (m.fromId === userId && m.toId === otherUserId) ||
        (m.fromId === otherUserId && m.toId === userId)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (e) {
    console.error('getMessages failed', e);
    return [];
  }
};
