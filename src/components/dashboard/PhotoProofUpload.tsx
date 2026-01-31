import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, Upload, CheckCircle2, X, User, Phone,
  Package, ImagePlus, Loader2, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhotoProofUploadProps {
  type: "pickup" | "delivery";
  deliveryId: string;
  parcelTitle?: string;
  onSuccess?: (photoUrl: string) => void;
  onClose?: () => void;
}

const PhotoProofUpload = ({ 
  type, 
  deliveryId, 
  parcelTitle,
  onSuccess, 
  onClose 
}: PhotoProofUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    phone: ""
  });

  const isDelivery = type === "delivery";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No photo selected",
        description: "Please capture or select a photo first",
        variant: "destructive"
      });
      return;
    }

    if (isDelivery && (!recipientInfo.name || !recipientInfo.phone)) {
      toast({
        title: "Recipient details required",
        description: "Please enter recipient name and phone number",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to upload photos",
          variant: "destructive"
        });
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${deliveryId}/${type}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('delivery-proofs')
        .getPublicUrl(fileName);

      // Update delivery record with photo URL
      const updateData = type === "pickup" 
        ? { pickup_photo_url: publicUrl }
        : { 
            delivery_photo_url: publicUrl,
            recipient_name: recipientInfo.name,
            recipient_phone: recipientInfo.phone
          };

      const { error: updateError } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (updateError) throw updateError;

      toast({
        title: type === "pickup" ? "Pickup verified!" : "Delivery completed!",
        description: "Photo proof uploaded successfully",
      });

      onSuccess?.(publicUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="card-glass border-border/30 max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-xl ${type === "pickup" ? "bg-primary/20" : "bg-success/20"}`}>
              <Camera className={`h-5 w-5 ${type === "pickup" ? "text-primary" : "text-success"}`} />
            </div>
            {type === "pickup" ? "Pickup Verification" : "Delivery Proof"}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {parcelTitle && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            {parcelTitle}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Photo Preview or Capture Area */}
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-xl border border-border/50"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
            <Badge className="absolute bottom-2 left-2 bg-success/90">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Photo ready
            </Badge>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center bg-secondary/20">
            <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {type === "pickup" 
                ? "Take a photo of the parcel before pickup"
                : "Take a photo with the recipient and parcel"
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleCameraCapture}>
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button variant="outline" onClick={handleGallerySelect}>
                <Upload className="h-4 w-4 mr-2" />
                Gallery
              </Button>
            </div>
          </div>
        )}

        {/* Recipient Details (for delivery only) */}
        {isDelivery && (
          <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" />
              Recipient Details
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Recipient Name</Label>
                <Input
                  placeholder="Enter name of person receiving"
                  value={recipientInfo.name}
                  onChange={(e) => setRecipientInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Recipient Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="10-digit mobile number"
                    value={recipientInfo.phone}
                    onChange={(e) => setRecipientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 bg-background/50"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-secondary/20">
          <MapPin className="h-4 w-4" />
          Location will be captured automatically with the photo
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || (isDelivery && (!recipientInfo.name || !recipientInfo.phone))}
          className="w-full"
          variant="hero"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {type === "pickup" ? "Confirm Pickup" : "Complete Delivery"}
            </>
          )}
        </Button>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Photo Guidelines:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Ensure good lighting and clear visibility</li>
            {type === "pickup" ? (
              <li>Capture the parcel condition clearly</li>
            ) : (
              <>
                <li>Include recipient's face and the parcel</li>
                <li>Recipient should be visible holding or near the parcel</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoProofUpload;