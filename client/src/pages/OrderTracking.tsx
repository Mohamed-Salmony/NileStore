import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [showTracking, setShowTracking] = useState(false);

  const orderData = {
    orderNumber: '#12345',
    status: 'في الطريق',
    estimatedDelivery: '25 أكتوبر 2025',
    items: [
      { name: 'سماعات لاسلكية', quantity: 1, price: 1299 },
      { name: 'ساعة ذكية', quantity: 1, price: 2499 },
    ],
  };

  const trackingSteps = [
    {
      title: 'تم تأكيد الطلب',
      description: '23 أكتوبر، 10:30 صباحاً',
      icon: CheckCircle,
      completed: true,
    },
    {
      title: 'جاري التجهيز',
      description: '23 أكتوبر، 2:00 مساءً',
      icon: Package,
      completed: true,
    },
    {
      title: 'خرج للتوصيل',
      description: '24 أكتوبر، 9:00 صباحاً',
      icon: Truck,
      completed: true,
    },
    {
      title: 'في الطريق',
      description: 'متوقع اليوم في 5:00 مساءً',
      icon: MapPin,
      completed: false,
      current: true,
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTracking(true);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-center">تتبع طلبك</h1>

          {!showTracking ? (
            <Card className="shadow-card max-w-md mx-auto">
              <CardHeader>
                <CardTitle>أدخل رقم الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">رقم الطلب</Label>
                    <Input
                      id="orderNumber"
                      placeholder="#12345"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">تتبع الطلب</Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>طلب {orderData.orderNumber}</CardTitle>
                      <p className="text-muted-foreground mt-1">الحالة: {orderData.status}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">التوصيل المتوقع</p>
                      <p className="font-semibold text-secondary">{orderData.estimatedDelivery}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{item.price} ج.م</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    تفاصيل الشحن
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trackingSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-4"
                      >
                        {/* Timeline Line */}
                        {index < trackingSteps.length - 1 && (
                          <div
                            className={`absolute right-6 top-12 w-0.5 h-16 ${
                              step.completed ? 'bg-secondary' : 'bg-border'
                            }`}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            step.current
                              ? 'bg-secondary text-white animate-pulse'
                              : step.completed
                              ? 'bg-secondary text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <step.icon className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                          <h3
                            className={`font-semibold mb-1 ${
                              step.current ? 'text-secondary' : ''
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="shadow-card">
                <CardContent className="p-0">
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">خريطة تتبع الشحنة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                onClick={() => setShowTracking(false)}
                className="w-full"
              >
                تتبع طلب آخر
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;
