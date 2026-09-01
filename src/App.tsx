import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/cart";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useSelector } from "react-redux";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RecoverPasswordPage from "./pages/auth/RecoverPasswordPage";
import VerifyOtp from "./pages/auth/VerifyOtp";
import SignUpPage from "./pages/auth/SignUpPage";
import DashboardWelcomePage from "./pages/dashboard/DashboardWelcomePage";
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import BookSessionPage from "./pages/dashboard/BookSessionPage";
import BookaSessionDashboard from "./pages/BookaSessionDashboard";
import ClassroomSessionsPage from "./pages/ClassroomSessionsPage";
import SessionBookedPage from "./pages/dashboard/SessionBookedPage";
import QuoteLmsPage from "./pages/dashboard/quotes/QuoteLmsPage";
import QuoteWriteToReadPage from "./pages/dashboard/quotes/QuoteWriteToReadPage";
import QuoteEnrichmentStorePage from "./pages/dashboard/quotes/QuoteEnrichmentStorePage";
import QuotationDocumentPage from "./pages/dashboard/quotes/QuotationDocumentPage";
import InviteStudent from "./pages/inviteStudent";
import QutationTracking from "./pages/qutationTracking";
import RequestQuotation from "./pages/qutationTracking/requestQuotation";
import ShopPage from "./pages/shop";
import ShopPaymentPage from "./pages/shop/ShopPaymentPage";
import QuoteDetails from "./pages/qutationTracking/quoteDetails";
import PurchaseOrder from "./pages/purchaseOrder";
import PurchaseOrderDetails from "./pages/purchaseOrder/purchaseOrderDetails";
import EnrichmentStore from "./pages/enrichmentStore";
import CartPage from "./pages/enrichmentStore/cart";
import ProductDetails from "./pages/enrichmentStore/ProductDetails";
import CheckoutPage from "./pages/enrichmentStore/checkout";
import PaymentPage from "./pages/enrichmentStore/payment";
import StripePayment from "./pages/stripePayment/index";
import MyOrdersPage from "./pages/myOrders";
import MyOrderDetails from "./pages/myOrders/MyOrderDetails";
import PayInvoice from "./pages/payInvoice";
import SubscribetoLMS from "./pages/subscribetoLMS";
import MyCourses from "./pages/myCourses";
import CourseDetails from "./pages/myCourses/CourseDetails";
import CourseQuizzes from "./pages/myCourses/CourseQuizzes";
import CourseTests from "./pages/myCourses/CourseTests";
import CourseExams from "./pages/myCourses/CourseExams";
import AssessmentPreview from "./pages/myCourses/AssessmentPreview";
import PdfFullPage from "./pages/myCourses/PdfFullPage";
import PdfFullscreenPage from "./pages/myCourses/PdfFullscreenPage";
import TeacherCareerExplorerPathway from "./pages/myCourses/TeacherCareerExplorerPathway";
import MyStudents from "./pages/myStudents";
import StudentProfile from "./pages/myStudents/StudentProfile";
import StudentPracticalSheetView from "./pages/myStudents/StudentPracticalSheetView";
import PracticalSheetsPage from "./pages/practicalSheets";
import PracticalSheetEntryDetailsPage from "./pages/practicalSheets/PracticalSheetEntryDetailsPage";
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
import WriteToReadGate from "./pages/writeToRead/WriteToReadGate";
import WriteToReadRouterLayout from "./pages/writeToRead/WriteToReadRouterLayout";
import WriteToRead from "./pages/writeToRead";
import BookBuilderPage from "./pages/writeToRead/BookBuilderPage";
import WtrAssignmentPreviewPage from "./pages/writeToRead/WtrAssignmentPreviewPage";
import WriteToReadSubscribePage from "./pages/writeToReadSubscribe";
import PublicBookReaderPage from "./pages/writeToRead/PublicBookReaderPage";
import AllSessions from "./pages/allSessions";
import SurveysList from "./pages/surveys";
import SurveyResponseView from "./pages/surveys/SurveyResponseView";
import SurveyAttempt from "./pages/surveys/SurveyAttempt";
import ProtectedRoute from "./pages/protectedRoute";
import { getBasename } from "./utils/Functions";
import { useEffect } from "react";
import socket from "@/config/socket";
import MessagesPage from "./pages/messages";
import VideoLibraryPage from "./pages/videoLibrary";
import IfuntologyPlatformPage from "./pages/ifuntology/PlatformPage";
import IfuntologyWriteToReadPage from "./pages/ifuntology/WriteToReadPage";
import FuntologyPage from "./pages/ifuntology/courses/FuntologyPage";
import BarbertologyPage from "./pages/ifuntology/courses/BarbertologyPage";
import NailtologyPage from "./pages/ifuntology/courses/NailtologyPage";
import SkintologyPage from "./pages/ifuntology/courses/SkintologyPage";
import FuntologyBusinessBuilderPage from "./pages/funtologyBusinessBuilder";
import BusinessBuilderWizard from "./pages/funtologyBusinessBuilder/BusinessBuilderWizard";
import SavedEstimatesListPage from "./pages/funtologyBusinessBuilder/SavedEstimatesListPage";
import SavedEstimateDetailPage from "./pages/funtologyBusinessBuilder/SavedEstimateDetailPage";
import ActorPortalSessionSync from "@/components/ActorPortalSessionSync";

const App = () => {
  const user = useSelector((state: any) => state.user.userData);
  useEffect(() => {
    if (user?._id) {
      socket.emit("setup", user);
    }
  }, [user]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      storageKey="ifuntology-theme"
      enableSystem={false}
    >
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={getBasename()}>
            <ActorPortalSessionSync />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/recover-password"
                element={<RecoverPasswordPage />}
              />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route path="/read/:shareToken" element={<PublicBookReaderPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardHomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/welcome" element={<DashboardWelcomePage />} />
              <Route path="/book-session" element={<BookSessionPage />} />
              <Route path="/session-booked" element={<SessionBookedPage />} />

              <Route
                path="/book-a-session"
                element={
                  <ProtectedRoute>
                    <BookaSessionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-a-session/classroom"
                element={
                  <ProtectedRoute>
                    <ClassroomSessionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-a-session/create-own"
                element={
                  <ProtectedRoute>
                    <ClassroomSessionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-sessions"
                element={
                  <ProtectedRoute>
                    <AllSessions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/shop"
                element={
                  <ProtectedRoute>
                    <ShopPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/payment"
                element={
                  <ProtectedRoute>
                    <ShopPaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <QutationTracking />
                </ProtectedRoute>
              } />
              {/* <Route
                path="/quotes/request"
                element={
                  <ProtectedRoute>
                    <RequestQuotation />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/quotes/:id"
                element={
                  <ProtectedRoute>
                    <QuoteDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchase-orders"
                element={
                  <ProtectedRoute>
                    <PurchaseOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchase-orders/:id"
                element={
                  <ProtectedRoute>
                    <PurchaseOrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enrichment-store"
                element={
                  <ProtectedRoute>
                    <EnrichmentStore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enrichment-store/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enrichment-store/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enrichment-store/payment"
                element={<PaymentPage />}
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <StripePayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders/:id"
                element={
                  <ProtectedRoute>
                    <MyOrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/pay-invoice" element={<PayInvoice />} />
              <Route path="/subscribe-to-lms" element={
                <ProtectedRoute>
                  <SubscribetoLMS />
                </ProtectedRoute>
              } />
              <Route path="/my-courses" element={
                <ProtectedRoute>
                  <MyCourses />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/pdf/:id/fullscreen" element={
                <ProtectedRoute>
                  <PdfFullscreenPage />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/pdf/:id" element={
                <ProtectedRoute>
                  <PdfFullPage />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/:courseType/quizzes" element={
                <ProtectedRoute>
                  <CourseQuizzes />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/:courseType/tests" element={
                <ProtectedRoute>
                  <CourseTests />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/:courseType/exams" element={
                <ProtectedRoute>
                  <CourseExams />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/:courseType/career-explorer-pathway" element={
                <ProtectedRoute>
                  <TeacherCareerExplorerPathway />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/assessment/:id/preview" element={
                <ProtectedRoute>
                  <AssessmentPreview />
                </ProtectedRoute>
              } />
              <Route path="/my-courses/:courseType" element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              } />
              <Route path="/my-students/:studentId/practical-sheet/:courseType" element={
                <ProtectedRoute>
                  <StudentPracticalSheetView />
                </ProtectedRoute>
              } />
              <Route path="/my-students/:studentId" element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              } />
              <Route path="/my-students" element={
                <ProtectedRoute>
                  <MyStudents />
                </ProtectedRoute>
              } />
              <Route path="/practical-sheets/:studentId/:courseType/:entryDate" element={
                <ProtectedRoute>
                  <PracticalSheetEntryDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/practical-sheets" element={
                <ProtectedRoute>
                  <PracticalSheetsPage />
                </ProtectedRoute>
              } />
              <Route path="/affiliate-program" element={
                <ProtectedRoute>
                  <AffiliateProgram />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={<Notifications />} />
              <Route
                path="/my-profile"
                element={
                  <ProtectedRoute>
                    <MyProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/support-tickets" element={
                <ProtectedRoute>
                  <SupportTickets />
                </ProtectedRoute>
              } />
              <Route
                path="/support-tickets/create"
                element={
                  <ProtectedRoute>
                    <CreateTicket />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support-tickets/faqs/affiliate"
                element={
                  <ProtectedRoute>
                    <AffiliateFaqs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support-tickets/faqs/store"
                element={
                  <ProtectedRoute>
                    <StoreFaqs />
                  </ProtectedRoute>
                }
              />
              <Route path="/support-tickets/faqs/lms" element={
                <ProtectedRoute>
                  <LmsFaqs />
                </ProtectedRoute>
              }
              />
              <Route
                path="/support-tickets/faqs/booking"
                element={
                  <ProtectedRoute>
                    <BookingFaqs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support-tickets/faqs/write-to-read"
                element={
                  <ProtectedRoute>
                    <WriteToReadFaqs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/write-to-read/subscribe"
                element={
                  <ProtectedRoute>
                    <WriteToReadSubscribePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/write-to-read"
                element={
                  <ProtectedRoute>
                    <WriteToReadGate />
                  </ProtectedRoute>
                }
              >
                <Route element={<WriteToReadRouterLayout />}>
                  <Route path="builder/:bookId/*" element={<BookBuilderPage />} />
                  <Route path="assignment-preview/:assignmentId" element={<WtrAssignmentPreviewPage />} />
                  <Route index element={<WriteToRead />} />
                </Route>
              </Route>

              <Route path="/invite-student" element={
                <ProtectedRoute>
                  <InviteStudent />
                </ProtectedRoute>
              } />
              <Route
                path="/video-library"
                element={
                  <ProtectedRoute>
                    <VideoLibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/surveys" element={
                <ProtectedRoute>
                  <SurveysList />
                </ProtectedRoute>
              } />
              <Route path="/surveys/response/:responseId" element={
                <ProtectedRoute>
                  <SurveyResponseView />
                </ProtectedRoute>
              } />
              <Route path="/surveys/:id" element={
                <ProtectedRoute>
                  <SurveyAttempt />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />

              <Route
                path="/courses/funtology"
                element={
                  <ProtectedRoute>
                    <FuntologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/barbertology"
                element={
                  <ProtectedRoute>
                    <BarbertologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/nailtology"
                element={
                  <ProtectedRoute>
                    <NailtologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/skintology"
                element={
                  <ProtectedRoute>
                    <SkintologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ifuntology/courses/funtology"
                element={
                  <ProtectedRoute>
                    <FuntologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ifuntology/courses/barbertology"
                element={
                  <ProtectedRoute>
                    <BarbertologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ifuntology/courses/nailtology"
                element={
                  <ProtectedRoute>
                    <NailtologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ifuntology/courses/skintology"
                element={
                  <ProtectedRoute>
                    <SkintologyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ifuntology/platform"
                element={
                  <ProtectedRoute>
                    <IfuntologyPlatformPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ifuntology/write-to-read"
                element={
                  <ProtectedRoute>
                    <IfuntologyWriteToReadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funtology-business-builder"
                element={
                  <ProtectedRoute>
                    <FuntologyBusinessBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funtology-business-builder/estimate"
                element={
                  <ProtectedRoute>
                    <BusinessBuilderWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funtology-business-builder/estimates"
                element={
                  <ProtectedRoute>
                    <SavedEstimatesListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funtology-business-builder/estimates/:id"
                element={
                  <ProtectedRoute>
                    <SavedEstimateDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funtology-business-builder/student-budget"
                element={
                  <ProtectedRoute>
                    <Navigate to="/funtology-business-builder/estimate" replace />
                  </ProtectedRoute>
                }
              />

              <Route path="/quotes/lms" element={<QuoteLmsPage />} />
              <Route
                path="/quotes/write-to-read"
                element={<QuoteWriteToReadPage />}
              />
              <Route
                path="/quotes/enrichment-store"
                element={<QuoteEnrichmentStorePage />}
              />
              <Route
                path="/quotation-document"
                element={<QuotationDocumentPage />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </ThemeProvider>
  )
}

export default App;
