//
// Ce fichier a été généré par Eclipse Implementation of JAXB, v3.0.0 
// Voir https://eclipse-ee4j.github.io/jaxb-ri 
// Toute modification apportée à ce fichier sera perdue lors de la recompilation du schéma source. 
// Généré le : 2025.12.23 à 08:33:39 PM WEST 
//


package com.hotel.reservation.soap;

import javax.xml.datatype.XMLGregorianCalendar;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlSchemaType;
import jakarta.xml.bind.annotation.XmlType;


/**
 * <p>Classe Java pour anonymous complex type.
 * 
 * <p>Le fragment de schéma suivant indique le contenu attendu figurant dans cette classe.
 * 
 * <pre>
 * &lt;complexType&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="clientId" type="{http://www.w3.org/2001/XMLSchema}long"/&gt;
 *         &lt;element name="roomId" type="{http://www.w3.org/2001/XMLSchema}long"/&gt;
 *         &lt;element name="checkInDate" type="{http://www.w3.org/2001/XMLSchema}date"/&gt;
 *         &lt;element name="checkOutDate" type="{http://www.w3.org/2001/XMLSchema}date"/&gt;
 *         &lt;element name="numberOfGuests" type="{http://www.w3.org/2001/XMLSchema}int"/&gt;
 *         &lt;element name="specialRequests" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/&gt;
 *         &lt;element name="status" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "clientId",
    "roomId",
    "checkInDate",
    "checkOutDate",
    "numberOfGuests",
    "specialRequests",
    "status"
})
@XmlRootElement(name = "CreateReservationRequest")
public class CreateReservationRequest {

    protected long clientId;
    protected long roomId;
    @XmlElement(required = true)
    @XmlSchemaType(name = "date")
    protected XMLGregorianCalendar checkInDate;
    @XmlElement(required = true)
    @XmlSchemaType(name = "date")
    protected XMLGregorianCalendar checkOutDate;
    protected int numberOfGuests;
    protected String specialRequests;
    protected String status;

    /**
     * Obtient la valeur de la propriété clientId.
     * 
     */
    public long getClientId() {
        return clientId;
    }

    /**
     * Définit la valeur de la propriété clientId.
     * 
     */
    public void setClientId(long value) {
        this.clientId = value;
    }

    /**
     * Obtient la valeur de la propriété roomId.
     * 
     */
    public long getRoomId() {
        return roomId;
    }

    /**
     * Définit la valeur de la propriété roomId.
     * 
     */
    public void setRoomId(long value) {
        this.roomId = value;
    }

    /**
     * Obtient la valeur de la propriété checkInDate.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getCheckInDate() {
        return checkInDate;
    }

    /**
     * Définit la valeur de la propriété checkInDate.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setCheckInDate(XMLGregorianCalendar value) {
        this.checkInDate = value;
    }

    /**
     * Obtient la valeur de la propriété checkOutDate.
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getCheckOutDate() {
        return checkOutDate;
    }

    /**
     * Définit la valeur de la propriété checkOutDate.
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setCheckOutDate(XMLGregorianCalendar value) {
        this.checkOutDate = value;
    }

    /**
     * Obtient la valeur de la propriété numberOfGuests.
     * 
     */
    public int getNumberOfGuests() {
        return numberOfGuests;
    }

    /**
     * Définit la valeur de la propriété numberOfGuests.
     * 
     */
    public void setNumberOfGuests(int value) {
        this.numberOfGuests = value;
    }

    /**
     * Obtient la valeur de la propriété specialRequests.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSpecialRequests() {
        return specialRequests;
    }

    /**
     * Définit la valeur de la propriété specialRequests.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSpecialRequests(String value) {
        this.specialRequests = value;
    }

    /**
     * Obtient la valeur de la propriété status.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStatus() {
        return status;
    }

    /**
     * Définit la valeur de la propriété status.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStatus(String value) {
        this.status = value;
    }

}
