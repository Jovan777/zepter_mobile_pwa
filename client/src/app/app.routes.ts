import { Routes } from '@angular/router';
import { regionSelectedGuard } from './core/guards/region-selected.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/splash/splash.page').then((m) => m.SplashPage)
  },
  {
    path: 'region',
    loadComponent: () =>
      import('./features/region-select/region-select.page').then((m) => m.RegionSelectPage)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'app',
    canActivate: [regionSelectedGuard],
    loadComponent: () =>
      import('./core/layout/mobile-shell/mobile-shell.component').then(
        (m) => m.MobileShellComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.page').then((m) => m.HomePage)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories.page').then((m) => m.CategoriesPage)
      },
      {
        path: 'categories/:slug',
        loadComponent: () =>
          import('./features/products/products.page').then((m) => m.ProductsPage)
      },
      {
        path: 'products/:publicId',
        loadComponent: () =>
          import('./features/product-details/product-details.page').then(
            (m) => m.ProductDetailsPage
          )
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/cart.page').then((m) => m.CartPage)
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout.page').then((m) => m.CheckoutPage)
      },
      {
        path: 'offer',
        loadComponent: () =>
          import('./features/offer/offer.page').then((m) => m.OfferPage)
      },
      {
        path: 'zepter-club',
        loadComponent: () =>
          import('./features/zepter-club/zepter-club.page').then((m) => m.ZepterClubPage)
      },
      {
        path: 'profile/settings',
        loadComponent: () =>
          import('./features/profile-settings/profile-settings.page').then(
            (m) => m.ProfileSettingsPage
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page').then((m) => m.ProfilePage)
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/clients.page').then((m) => m.ClientsPage)
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/wishlist/wishlist.page').then((m) => m.WishlistPage)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders.page').then((m) => m.OrdersPage)
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/help/help.page').then((m) => m.HelpPage)
      },
      {
        path: 'language',
        loadComponent: () =>
          import('./features/language/language.page').then((m) => m.LanguagePage)
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./features/blog/blog.page').then((m) => m.BlogPage)
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./features/blog-details/blog-details.page').then(
            (m) => m.BlogDetailsPage
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'splash'
  }
];
