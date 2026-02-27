import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Plus,
  CreditCard,
  Trash2,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { UPLOADS_URL } from "@/constants/api";
import { useGetSavedPaymentMethodsQuery, useDeleteSavedPaymentMethodMutation } from "@/redux/services/apiSlices/paymentSlice";
import { useGetMySubscriptionsQuery, useToggleAutoRenewalMutation, useCancelSubscriptionMutation } from "@/redux/services/apiSlices/subscriptionSlice";
import { toast } from "sonner";

export default function MyProfile() {
  useEffect(() => {
    document.title = "My Profile • iFuntology Teacher";
  }, []);
  const user = useSelector((state: RootState) => state.user.userData);
  const { data: paymentData, isLoading: cardsLoading } = useGetSavedPaymentMethodsQuery();
  const savedCards: any[] = paymentData?.data?.data ?? [];
  const { data: subscriptions, isLoading } = useGetMySubscriptionsQuery(
    { status: "ACTIVE" }
  );
  const subscriptionsData = subscriptions?.data?.docs ?? [];
  const totalStudents = subscriptionsData.reduce((acc: number, s: any) => acc + (s?.usedSeats ?? 0), 0);
  const [toggleAutoRenewal] = useToggleAutoRenewalMutation();
  const [togglingSubscriptionId, setTogglingSubscriptionId] = useState<string | null>(null);
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<string | null>(null);
  const [deleteSavedPaymentMethod] = useDeleteSavedPaymentMethodMutation();
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleToggleAutoRenewal = async (subscriptionId: string, checked: boolean) => {
    setTogglingSubscriptionId(subscriptionId);
    try {
      const res: any = await toggleAutoRenewal({ subscriptionId, autoRenew: checked }).unwrap();
      if (res.status) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to toggle auto-renewal.");
      console.error("Failed to toggle auto-renewal:", error);
    } finally {
      setTogglingSubscriptionId(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancellingSubscriptionId(subscriptionId);
    try {
      const res: any = await cancelSubscription({ subscriptionId }).unwrap();
      if (res.status) {
        toast.success(res.message ?? "Subscription cancelled successfully.");
      } else {
        toast.error(res.message ?? "Failed to cancel subscription.");
      }
    } catch (error) {
      toast.error("Failed to cancel subscription.");
      console.error("Failed to cancel subscription:", error);
    } finally {
      setCancellingSubscriptionId(null);
    }
  };


  const handleDeleteCard = async (paymentMethodId: string) => {
    setDeletingCardId(paymentMethodId);
    try {
      const res: any = await deleteSavedPaymentMethod({ paymentMethodId }).unwrap();
      if (res.status) {
        toast.success(res.message ?? "Card removed successfully.");
      } else {
        toast.error(res.message ?? "Failed to remove card.");
      }
    } catch (error) {
      toast.error("Failed to remove card.");
      console.error("Failed to delete card:", error);
    } finally {
      setDeletingCardId(null);
    }
  };

  console.log(subscriptionsData, 'subscriptionsData');
  return (
    <DashboardWithSidebarLayout>
      <div className="mx-auto w-full space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32 ring-4 ring-slate-50 dark:ring-slate-800">
                  <AvatarImage
                    src={
                      user?.image ? `${UPLOADS_URL}${user.image}` : undefined
                    }
                  />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-1 mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
                <div className="pt-1">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900 font-medium rounded-full px-4"
                  >
                    Organization
                  </Badge>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 truncate">
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {user?.phoneNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {user?.organization}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Member since
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-lime-500" />
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "-"}
                </p>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Active Subscriptions
                  </span>
                  <span className="font-bold text-orange-500">{subscriptionsData.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Total Students
                  </span>
                  <span className="font-bold text-orange-500">{totalStudents}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Payment Methods
                  </span>
                  <span className="font-bold text-orange-500">{savedCards.length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Tabs Content */}
          <div className="lg:col-span-8">
            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm h-full">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="bg-transparent border-b border-slate-100 dark:border-slate-800 w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto gap-8">
                  {[
                    "Account Details",
                    "Subscriptions",
                    "Payment Methods",
                    "Notifications",
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab.toLowerCase().split(" ")[0]}
                      className="bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-slate-500 rounded-none h-auto py-3 px-0 font-bold transition-all text-xs shadow-none"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Account Details Tab */}
                <TabsContent
                  value="account"
                  className="space-y-8 mt-0 outline-none"
                >
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.firstName || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.lastName || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.email || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.phoneNumber || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Organization Name{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.organization || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.streetAddress || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.city || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          State <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.state || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Zip Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.zipCode || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={user?.country || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent
                  value="subscriptions"
                  className="space-y-6 mt-0 outline-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : subscriptionsData.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-10">
                      No active subscriptions found.
                    </p>
                  ) : (
                    subscriptionsData.map((sub: any) => {
                      const renewsOn = sub?.endDate
                        ? new Date(sub.endDate).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "—";
                      const startedOn = sub?.startDate
                        ? new Date(sub.startDate).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "—";
                      const billingPeriod =
                        sub?.subscriptionType === "MONTHLY" ? "Per Month" : "Per Year";

                      return (
                        <div
                          key={sub._id}
                          className="rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex items-center justify-center bg-orange-50 dark:bg-orange-950/20 text-orange-500 rounded-xl">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-slate-900 dark:text-white">
                                    {sub.courseType}
                                  </h4>
                                  <Badge className="bg-green-500 hover:bg-green-600 border-none text-[10px] font-bold px-2 py-0 h-4">
                                    {sub.status.charAt(0) + sub.status.slice(1).toLowerCase()}
                                  </Badge>
                                </div>
                                {!sub.byPurchaseOrder ? (<p className="text-xs text-slate-500 font-medium">
                                  Renews on {renewsOn}
                                </p>) : (
                                  <p className="text-xs text-slate-500 font-medium">
                                    One-time subscription
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">
                                ${sub.amount.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {billingPeriod}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 text-center">
                                Students Enrolled
                              </p>
                              <p className="text-lg font-bold text-slate-900 dark:text-white text-center">
                                {sub.usedSeats ?? 0}/{sub.numberOfSeats ?? 0}
                              </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 text-center">
                                Started
                              </p>
                              <p className="text-lg font-bold text-slate-900 dark:text-white text-center">
                                {startedOn}
                              </p>
                            </div>
                           {!sub.byPurchaseOrder ? (<div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                                Auto-Renew
                              </p>
                              {togglingSubscriptionId === sub._id ? (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                              ) : (
                                <Switch
                                  checked={sub.autoRenew}
                                  disabled={togglingSubscriptionId !== null}
                                  onCheckedChange={(checked) => handleToggleAutoRenewal(sub._id, checked)}
                                />
                              )}
                            </div>) : (
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                                  Auto-Renew
                                </p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white text-center">
                                  One-time subscription
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-4">
                            {/* <Button className="flex-1 rounded-full bg-lime-500 hover:bg-lime-600 text-white font-bold h-11 border-none">
                              Renew Now
                            </Button> */}
                            <Button
                              variant="destructive"
                              className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 border-none shadow-none"
                              disabled={cancellingSubscriptionId === sub._id}
                              onClick={() => handleCancelSubscription(sub._id)}
                            >
                              {cancellingSubscriptionId === sub._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Cancel Subscription"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>

                {/* Payment Methods Tab */}
                <TabsContent
                  value="payment"
                  className="space-y-6 mt-0 outline-none"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Payment Methods
                    </h3>
                    {/* <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white h-10 px-6 gap-2 border-none">
                      <Plus className="h-4 w-4" />
                      New Card
                    </Button> */}
                  </div>

                  <div className="space-y-4">
                    {cardsLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : savedCards.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-10">
                        No saved cards found.
                      </p>
                    ) : (
                      savedCards.map((pm: any) => {
                        const brand = pm?.card?.brand ?? "card";
                        const last4 = pm?.card?.last4 ?? "****";
                        const expMonth = String(pm?.card?.exp_month ?? "").padStart(2, "0");
                        const expYear = String(pm?.card?.exp_year ?? "").slice(-2);
                        const expiry = `${expMonth}/${expYear}`;
                        const label = `${brand.charAt(0).toUpperCase() + brand.slice(1)} ****${last4}`;

                        return (
                          <div
                            key={pm.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {label}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Expires {expiry}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                className="rounded-full bg-red-500 text-white hover:bg-red-600 hover:text-white h-9 px-4 text-xs font-bold border-none"
                                disabled={deletingCardId === pm.id}
                                onClick={() => handleDeleteCard(pm.id)}
                              >
                                {deletingCardId === pm.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Remove"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent
                  value="notifications"
                  className="space-y-8 mt-0 outline-none"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Notification Preferences
                  </h3>

                  <div className="rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-8">
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Student Activity
                      </h4>
                      {[
                        {
                          label: "Student Activity Updates",
                          sub: "Get notified when students complete modules or lessons",
                        },
                        {
                          label: "Quiz Attempts",
                          sub: "Receive alerts when students attempt quizzes or tests",
                        },
                        {
                          label: "Certificates Earned",
                          sub: "Know when students unlock new certificates",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="space-y-1">
                            <Label className="text-sm font-bold text-slate-900 dark:text-white inline">
                              {item.label}
                            </Label>
                            <p className="text-xs text-slate-500 font-medium">
                              {item.sub}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Account & Subscriptions
                      </h4>
                      {[
                        {
                          label: "New Student Enrollment",
                          sub: "Alerts when new students join your batches",
                        },
                        {
                          label: "Subscription Renewals",
                          sub: "Reminders about upcoming subscription renewals",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1"
                        >
                          <div className="space-y-1">
                            <Label className="text-sm font-bold text-slate-900 dark:text-white inline">
                              {item.label}
                            </Label>
                            <p className="text-xs text-slate-500 font-medium">
                              {item.sub}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        System & Marketing
                      </h4>
                      {[
                        {
                          label: "System Updates",
                          sub: "Platform updates and new feature announcements",
                          checked: false,
                        },
                        {
                          label: "Marketing Emails",
                          sub: "Promotional offers and course recommendations",
                          checked: false,
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1 text-slate-400"
                        >
                          <div className="space-y-1">
                            <Label className="text-sm font-bold inline">
                              {item.label}
                            </Label>
                            <p className="text-xs font-medium">{item.sub}</p>
                          </div>
                          <Switch defaultChecked={item.checked} />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </DashboardWithSidebarLayout>
  );
}
