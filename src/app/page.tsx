/* eslint-disable @next/next/no-img-element */
'use client';

import Image from 'next/image'
import styles from './page.module.scss'
import logo from '../../public/logo.svg'
import wishlistIcon from '../../public/wishlist-icon.svg'
import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { useLocalStorage } from 'usehooks-ts'

const queryClient = new QueryClient();

type Product = {
	id: number,
	title: string,
	description: string,
	price: number,
	discountPercentage: number,
	rating: number,
	stock: number,
	brand: string,
	category: string,
	thumbnail: string,
	images: string[]
};
type WishlistItem = {
	product: Product,
	quantity: number
}

export default function Home() {
	const [wishlist, setWishlist] = useLocalStorage<WishlistItem[]>('wishlist', [])
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const productsQuery = useQuery('products', () =>
		fetch('https://dummyjson.com/products').then(res =>
			res.json()
		)
	)

	return (
		<QueryClientProvider client={queryClient}>
			<header className={styles.banner} role="banner">
				<section className={styles.bannerContent}>
					<Image
						src={logo}
						alt="logo"
						height="70"
					/>
					<button onClick={() => setSidebarOpen(true)} className={styles.wishlistButton}>
						<Image
							src={wishlistIcon}
							alt="Wishlist"
							height="50"
						/>
						Wishlist
						{wishlist.length > 0 && (
							<div className={styles.wishlistBadge}>
								{wishlist.reduce((pv, cv) => pv + cv.quantity, 0)}
							</div>
						)}
					</button>
				</section>
			</header>
			<aside className={sidebarOpen ? styles.sidebarOpenWrapper : styles.sidebarWrapper}>
				<div onClick={() => setSidebarOpen(false)} className={styles.sidebarOverlay}></div>
				<div className={styles.sidebar}>
					<article className={styles.wishlist}>
						{wishlist.length === 0 && (
							<div style={{textAlign: 'center', padding: '20px 0'}}>
								There are no products on your wishlist
							</div>
						)}

						{wishlist.length > 0 && (
							<section>
								{wishlist.map(i => (
									<article key={i.product.id} className={styles.product}>
										<div className={styles.productContent}>
											<div className={styles.productQuantity}>
												<button
													onClick={() => setWishlist((wishlist) => {
														const item = wishlist.find(ci => ci.product.id === i.product.id);
														if (item?.quantity == 1) {
															return wishlist.filter(ci => ci.product.id != i.product.id)
														}
														if (item) {
															item.quantity--;
														}
														return wishlist;
													})}
												>-</button>
												<div>{i.quantity}</div>
												<button
													onClick={() => setWishlist((wishlist) => {
														const item = wishlist.find(ci => ci.product.id === i.product.id);
														if (item) {
															item.quantity++;
														}
														return wishlist;
													})}
												>+</button>
											</div>
											<h2>{i.product.title}</h2>
											<img
												src={i.product.thumbnail}
												alt={i.product.title}
												width="70"
												height="50"
											/>
										</div>
										{/* {wishlist.some(i => i.product.id === product.id) ? (
											<button
												onClick={() => setWishlist((wishlist) => wishlist.filter(i => i.product.id != product.id))}
												data-func="remove"
											>Remove from wishlist</button>
										) : (
											<button
												onClick={() => setWishlist((wishlist) => wishlist.concat({
													product,
													quantity: 1
												}))}
												data-func="add"
											>Add to wishlist</button>
										)} */}
									</article>
								))}
							</section>
						)}
					</article>
				</div>
			</aside>
			<main className={styles.content}>
				<article className={styles.products}>
					{productsQuery.isLoading && (
						<div style={{textAlign: 'center'}}>
							Products are being loaded...
						</div>
					)}

					{productsQuery.isError && (
						<div style={{textAlign: 'center'}}>
							Products could not be loaded
						</div>
					)}

					{productsQuery.isSuccess && (
						<section>
							{productsQuery.data.products.map((product: Product) => (
								<article key={product.id} className={styles.product}>
									<div className={styles.productContent}>
										<img
											src={product.thumbnail}
											alt={product.title}
											width="150"
											height="100"
										/>
										<h2>{product.title}</h2>
										<p>
											{product.description}
										</p>
									</div>
									{wishlist.some(i => i.product.id === product.id) ? (
										<button
											onClick={() => setWishlist((wishlist) => wishlist.filter(i => i.product.id != product.id))}
											data-func="remove"
										>Remove from wishlist</button>
									) : (
										<button
											onClick={() => setWishlist((wishlist) => wishlist.concat({
												product,
												quantity: 1
											}))}
											data-func="add"
										>Add to wishlist</button>
									)}
								</article>
							))}
						</section>
					)}
				</article>
			</main>
		</QueryClientProvider>
	)
}
