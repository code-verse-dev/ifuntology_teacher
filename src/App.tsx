import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/cart";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RecoverPasswordPage from "./pages/auth/RecoverPasswordPage";
import SignUpPage from "./pages/auth/SignUpPage";

import DashboardWelcomePage from "./pages/dashboard/DashboardWelcomePage";
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import BookSessionPage from "./pages/dashboard/BookSessionPage";
import BookaSessionDashboard from "./pages/BookaSessionDashboard";
import SessionBookedPage from "./pages/dashboard/SessionBookedPage";

import QuoteLmsPage from "./pages/dashboard/quotes/QuoteLmsPage";
import QuoteWriteToReadPage from "./pages/dashboard/quotes/QuoteWriteToReadPage";
import QuoteEnrichmentStorePage from "./pages/dashboard/quotes/QuoteEnrichmentStorePage";
import QuotationDocumentPage from "./pages/dashboard/quotes/QuotationDocumentPage";
import InviteStudent from "./pages/inviteStudent";
import QutationTracking from "./pages/qutationTracking";
import RequestQuotation from "./pages/qutationTracking/requestQuotation";
import PurchaseOrder from "./pages/purchaseOrder";
import PurchaseOrderDetails from "./pages/purchaseOrder/purchaseOrderDetails";
import EnrichmentStore from "./pages/enrichmentStore";
import CartPage from "./pages/enrichmentStore/cart";
import ProductDetails from "./pages/enrichmentStore/ProductDetails";
import CheckoutPage from "./pages/enrichmentStore/checkout";
import PaymentPage from "./pages/enrichmentStore/payment";
import MyOrdersPage from "./pages/myOrders";
import MyOrderDetails from "./pages/myOrders/MyOrderDetails";
import PayInvoice from "./pages/payInvoice";
import SubscribetoLMS from "./pages/subscribetoLMS";
import MyCourses from "./pages/myCourses";
import CourseDetails from "./pages/myCourses/CourseDetails";
import MyStudents from "./pages/myStudents";
import AffiliateProgram from "./pages/affiliateProgram";
import Notifications from "./pages/notifications";
import MyProfile from "./pages/myProfile";
import SupportTickets from "./pages/supportTickets";
import CreateTicket from "./pages/supportTickets/CreateTicket";
import AffiliateFaqs from "./pages/supportTickets/AffiliateFaqs";
import StoreFaqs from "./pages/supportTickets/StoreFaqs";
import LmsFaqs from "./pages/supportTickets/LmsFaqs";
import BookingFaqs from "./pages/supportTickets/BookingFaqs";
import WriteToReadFaqs from "./pages/supportTickets/WriteToReadFaqs";









const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="ifuntology-theme" enableSystem={false}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/recover-password" element={<RecoverPasswordPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />

              <Route path="/dashboard" element={<DashboardHomePage />} />
              <Route path="/welcome" element={<DashboardWelcomePage />} />
              <Route path="/book-session" element={<BookSessionPage />} />
              <Route path="/session-booked" element={<SessionBookedPage />} />

              <Route path="/book-a-session" element={<BookaSessionDashboard />} />

              <Route path="/quotes" element={<QutationTracking />} />
              <Route path="/quotes/request" element={<RequestQuotation />} />
              <Route path="/purchase-orders" element={<PurchaseOrder />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />
              <Route path="/enrichment-store" element={<EnrichmentStore />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/enrichment-store/product/:id" element={<ProductDetails />} />
              <Route path="/enrichment-store/checkout" element={<CheckoutPage />} />
              <Route path="/enrichment-store/payment" element={<PaymentPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/my-orders/:id" element={<MyOrderDetails />} />
              <Route path="/pay-invoice" element={<PayInvoice />} />
              <Route path="/subscribe-to-lms" element={<SubscribetoLMS />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/my-courses/:id" element={<CourseDetails />} />
              <Route path="/my-students" element={<MyStudents />} />
              <Route path="/affiliate-program" element={<AffiliateProgram />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/support-tickets" element={<SupportTickets />} />
              <Route path="/support-tickets/create" element={<CreateTicket />} />
              <Route path="/support-tickets/faqs/affiliate" element={<AffiliateFaqs />} />
              <Route path="/support-tickets/faqs/store" element={<StoreFaqs />} />
              <Route path="/support-tickets/faqs/lms" element={<LmsFaqs />} />
              <Route path="/support-tickets/faqs/booking" element={<BookingFaqs />} />
              <Route path="/support-tickets/faqs/write-to-read" element={<WriteToReadFaqs />} />









              <Route path="/invite-student" element={<InviteStudent />} />

              <Route path="/quotes/lms" element={<QuoteLmsPage />} />
              <Route path="/quotes/write-to-read" element={<QuoteWriteToReadPage />} />
              <Route path="/quotes/enrichment-store" element={<QuoteEnrichmentStorePage />} />
              <Route path="/quotation-document" element={<QuotationDocumentPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
