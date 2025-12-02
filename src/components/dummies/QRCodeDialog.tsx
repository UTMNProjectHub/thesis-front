import QRCode from "react-qr-code"
import { DialogContent, DialogDescription, DialogHeader } from "../ui/dialog";

interface IQRCodeDialogProps {
    description?: string
    qrValue: string
}

function QRCodeDialog(props: IQRCodeDialogProps) {
    return (
        <DialogContent>
            <DialogHeader>
                QR-код: 
                {props.description && <DialogDescription>{props.description}</DialogDescription>}
            </DialogHeader>
            <QRCode value={props.qrValue} />
        </DialogContent>
    )
}

export default QRCodeDialog