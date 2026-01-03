//
// Ce fichier a été généré par Eclipse Implementation of JAXB, v3.0.0 
// Voir https://eclipse-ee4j.github.io/jaxb-ri 
// Toute modification apportée à ce fichier sera perdue lors de la recompilation du schéma source. 
// Généré le : 2025.12.23 à 08:33:39 PM WEST 
//


package com.hotel.reservation.soap;

import jakarta.xml.bind.annotation.XmlRegistry;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.hotel.reservation.soap package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {


    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.hotel.reservation.soap
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link CreateReservationRequest }
     * 
     */
    public CreateReservationRequest createCreateReservationRequest() {
        return new CreateReservationRequest();
    }

    /**
     * Create an instance of {@link CreateReservationResponse }
     * 
     */
    public CreateReservationResponse createCreateReservationResponse() {
        return new CreateReservationResponse();
    }

    /**
     * Create an instance of {@link ReservationInfo }
     * 
     */
    public ReservationInfo createReservationInfo() {
        return new ReservationInfo();
    }

    /**
     * Create an instance of {@link GetReservationRequest }
     * 
     */
    public GetReservationRequest createGetReservationRequest() {
        return new GetReservationRequest();
    }

    /**
     * Create an instance of {@link GetReservationResponse }
     * 
     */
    public GetReservationResponse createGetReservationResponse() {
        return new GetReservationResponse();
    }

    /**
     * Create an instance of {@link UpdateReservationRequest }
     * 
     */
    public UpdateReservationRequest createUpdateReservationRequest() {
        return new UpdateReservationRequest();
    }

    /**
     * Create an instance of {@link UpdateReservationResponse }
     * 
     */
    public UpdateReservationResponse createUpdateReservationResponse() {
        return new UpdateReservationResponse();
    }

    /**
     * Create an instance of {@link DeleteReservationRequest }
     * 
     */
    public DeleteReservationRequest createDeleteReservationRequest() {
        return new DeleteReservationRequest();
    }

    /**
     * Create an instance of {@link DeleteReservationResponse }
     * 
     */
    public DeleteReservationResponse createDeleteReservationResponse() {
        return new DeleteReservationResponse();
    }

}
